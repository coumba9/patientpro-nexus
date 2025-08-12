import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // In development mode, simulate payment
    const isDevelopment = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined

    if (isDevelopment) {
      console.log('Development mode: simulating payment for', transactionId)
      
      // Simulate successful payment
      const mockResponse = {
        success: true,
        redirectUrl: `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=${paymentMethod}`,
        token: transactionId,
        message: "Payment initiated successfully (development mode)"
      }

      return new Response(
        JSON.stringify(mockResponse),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Production payment processing
    let redirectUrl = `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=${paymentMethod}`;
    
    // Map payment methods to appropriate redirect URLs or simulate payment processing
    switch (paymentMethod) {
      case 'wave':
        // In production, this would integrate with Wave API
        redirectUrl = `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=wave`;
        break;
      case 'orange-money':
        // In production, this would integrate with Orange Money API
        redirectUrl = `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=orange-money`;
        break;
      case 'mobile-money':
        // In production, this would integrate with MTN Mobile Money API
        redirectUrl = `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=mobile-money`;
        break;
      case 'card':
        // In production, this would integrate with a card payment processor
        redirectUrl = `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=card`;
        break;
      default:
        redirectUrl = `${req.headers.get('origin')}/payment-confirmation?token=${transactionId}&method=${paymentMethod}`;
    }

    const paymentResponse = {
      success: true,
      redirectUrl,
      token: transactionId,
      message: "Payment initiated successfully"
    }

    console.log('Payment initiated:', {
      transactionId,
      amount,
      currency,
      paymentMethod,
      userId: user.id
    })

    return new Response(
      JSON.stringify(paymentResponse),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

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