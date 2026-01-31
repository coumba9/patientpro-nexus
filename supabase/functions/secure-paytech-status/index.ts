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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Payment token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get PayTech API credentials
    const paytechApiKey = Deno.env.get('PAYTECH_API_KEY');
    const paytechApiSecret = Deno.env.get('PAYTECH_API_SECRET');

    if (!paytechApiKey || !paytechApiSecret) {
      console.error('PayTech credentials not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Verifying payment with PayTech API for token:', token);

    // Verify payment status with PayTech API
    // PayTech uses IPN but also provides a status check endpoint
    const verifyResponse = await fetch('https://paytech.sn/api/payment/check-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API_KEY': paytechApiKey,
        'API_SECRET': paytechApiSecret,
      },
      body: JSON.stringify({ token }),
    });

    // Log the response for debugging
    const responseText = await verifyResponse.text();
    console.log('PayTech API response status:', verifyResponse.status);
    console.log('PayTech API response:', responseText);

    let paymentData;
    try {
      paymentData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse PayTech response:', e);
      // If PayTech API is unavailable or returns invalid response,
      // we must NOT assume success - fail closed for security
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unable to verify payment status with payment provider',
          status: 'verification_failed'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if PayTech confirmed the payment
    // PayTech returns different status values - handle appropriately
    const isPaymentSuccess = 
      paymentData.status === 'success' || 
      paymentData.status === 'completed' ||
      paymentData.status === 'paid' ||
      paymentData.success === true ||
      paymentData.success === 1;

    if (!isPaymentSuccess) {
      console.log('Payment not confirmed by PayTech:', paymentData);
      return new Response(
        JSON.stringify({
          success: false,
          status: paymentData.status || 'not_completed',
          error: 'Payment has not been completed',
          data: {
            token,
            provider_status: paymentData.status
          }
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Payment verified successfully with PayTech
    console.log('Payment verified successfully with PayTech');

    return new Response(
      JSON.stringify({
        success: true,
        status: "completed",
        data: {
          token,
          message: "Payment verified successfully with PayTech API",
          provider_status: paymentData.status,
          verified_at: new Date().toISOString()
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment status check error:', error);
    
    // Fail closed - do not return success on error
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Payment status check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})
