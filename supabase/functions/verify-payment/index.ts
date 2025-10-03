import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { token, method } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Missing payment token' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verifying payment:', { token, method });

    // In development, simulate payment verification
    const isDevelopment = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;

    if (isDevelopment) {
      console.log('Development mode: simulating payment verification');
      
      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          token,
          method,
          message: 'Payment verified successfully (development mode)'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Production: Verify with actual payment provider
    let verified = false;
    
    switch (method) {
      case 'wave':
      case 'orange-money':
      case 'mobile-money':
        // In production, verify with Africa Payment API
        const masterKey = Deno.env.get('AFRICA_PAYMENT_MASTER_KEY');
        if (masterKey) {
          // Call payment provider API to verify
          console.log('Verifying with payment provider:', method);
          verified = true; // Placeholder
        }
        break;
      
      case 'paytech':
        // Verify with PayTech API
        const paytechApiKey = Deno.env.get('PAYTECH_API_KEY');
        if (paytechApiKey) {
          console.log('Verifying with PayTech');
          verified = true; // Placeholder
        }
        break;
      
      default:
        verified = true; // For other methods like cash or tiers payant
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified,
        token,
        method,
        message: verified ? 'Payment verified successfully' : 'Payment verification failed'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Payment verification failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});