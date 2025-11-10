import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Paydunya API configuration
const PAYDUNYA_API_URL = 'https://app.paydunya.com/api/v1'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { amount, currency, description, customer, metadata, paymentMethod } = await req.json()

    // Validate required fields
    if (!amount || !currency || !description || !customer || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get payment API secrets from Supabase secrets
    const masterKey = Deno.env.get('AFRICA_PAYMENT_MASTER_KEY')
    const privateKey = Deno.env.get('AFRICA_PAYMENT_PRIVATE_KEY')
    const token = Deno.env.get('AFRICA_PAYMENT_TOKEN')

    if (!masterKey || !privateKey || !token) {
      console.error('Missing payment API secrets')
      return new Response(
        JSON.stringify({ error: 'Payment service configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate transaction ID
    const transactionId = `APT-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    const origin = req.headers.get('origin') || 'https://2d1e06e9-1ac5-4986-bf1c-2e073ed53cf0.lovableproject.com'

    console.log('Initiating Paydunya payment:', {
      transactionId,
      amount,
      currency,
      paymentMethod,
      userId: user.id
    })

    try {
      // Step 1: Create invoice with Paydunya
      const invoicePayload = {
        invoice: {
          total_amount: amount,
          description: description,
        },
        store: {
          name: metadata?.storeName || "Medical Appointment",
        },
        actions: {
          cancel_url: `${origin}/book-appointment`,
          return_url: `${origin}/payment-confirmation?token=${transactionId}&method=${paymentMethod}`,
          callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
        },
        custom_data: {
          transactionId,
          userId: user.id,
          ...metadata
        }
      }

      console.log('Creating Paydunya invoice...')
      
      const invoiceResponse = await fetch(`${PAYDUNYA_API_URL}/checkout-invoice/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': masterKey,
          'PAYDUNYA-PRIVATE-KEY': privateKey,
          'PAYDUNYA-TOKEN': token,
        },
        body: JSON.stringify(invoicePayload)
      })

      const invoiceData = await invoiceResponse.json()
      console.log('Paydunya invoice response:', invoiceData)

      if (!invoiceResponse.ok || !invoiceData.response_code || invoiceData.response_code !== '00') {
        throw new Error(invoiceData.response_text || 'Failed to create invoice')
      }

      // Step 2: Get payment URL for specific method
      let paymentUrl = invoiceData.response_text || invoiceData.url

      // Map payment channels
      const channelMap: Record<string, string> = {
        'wave': 'wave-senegal',
        'orange-money': 'orange-money-senegal',
        'mobile-money': 'mtn-benin',
        'card': 'card'
      }

      const channel = channelMap[paymentMethod] || paymentMethod

      // If we have a specific channel, append it to the URL
      if (paymentUrl && channel) {
        paymentUrl = `${paymentUrl}?channel=${channel}`
      }

      console.log('Payment initiated successfully:', {
        transactionId,
        invoiceToken: invoiceData.token,
        paymentUrl
      })

      return new Response(
        JSON.stringify({
          success: true,
          redirectUrl: paymentUrl,
          token: transactionId,
          invoiceToken: invoiceData.token,
          message: "Payment initiated successfully"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (error) {
      console.error('Paydunya API error:', error)
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment initiation failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Payment error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})