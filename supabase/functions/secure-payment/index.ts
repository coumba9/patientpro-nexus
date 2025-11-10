import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// @ts-ignore
import AfricaPayments, { PaydunyaPaymentProvider, PaymentMethod, Currency } from 'npm:@tecafrik/africa-payment-sdk@^1.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const publicKey = Deno.env.get('AFRICA_PAYMENT_PUBLIC_KEY')
    const token = Deno.env.get('AFRICA_PAYMENT_TOKEN')

    if (!masterKey || !privateKey || !publicKey || !token) {
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
    const transactionId = `APPOINTMENT-${Date.now()}-${Math.floor(Math.random() * 10000)}`

    console.log('Initiating payment with Africa Payment SDK:', {
      transactionId,
      amount,
      currency,
      paymentMethod,
      userId: user.id
    })

    try {
      // Initialize Africa Payment SDK with Paydunya provider
      const africaPayments = new AfricaPayments(
        new PaydunyaPaymentProvider({
          masterKey,
          privateKey,
          publicKey,
          token,
          mode: Deno.env.get('DENO_DEPLOYMENT_ID') ? 'live' : 'test',
          store: {
            name: metadata?.storeName || "Medical Appointment System",
          },
        })
      )

      // Map payment method string to SDK enum
      let sdkPaymentMethod = PaymentMethod.WAVE
      switch (paymentMethod) {
        case 'wave':
          sdkPaymentMethod = PaymentMethod.WAVE
          break
        case 'orange-money':
          sdkPaymentMethod = PaymentMethod.ORANGE_MONEY
          break
        case 'mobile-money':
          sdkPaymentMethod = PaymentMethod.MTN_MOBILE_MONEY
          break
        case 'card':
          sdkPaymentMethod = PaymentMethod.CREDIT_CARD
          break
      }

      // Initiate checkout
      const checkoutResult = await africaPayments.checkout({
        paymentMethod: sdkPaymentMethod,
        amount,
        description,
        currency: currency as Currency,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          email: customer.email,
        },
        transactionId,
        metadata: metadata || {},
      })

      console.log('Africa Payment SDK checkout result:', checkoutResult)

      // Return the result with redirect URL
      return new Response(
        JSON.stringify({
          success: true,
          redirectUrl: checkoutResult.redirectUrl || `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=${paymentMethod}`,
          token: transactionId,
          message: "Payment initiated successfully"
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (sdkError) {
      console.error('Africa Payment SDK error:', sdkError)
      
      // Return error response
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Payment initiation failed',
          message: sdkError instanceof Error ? sdkError.message : 'Unknown error'
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