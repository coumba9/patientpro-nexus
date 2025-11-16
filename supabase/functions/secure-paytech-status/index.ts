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

    // Get PayTech credentials from environment
    const paytechApiKey = Deno.env.get('PAYTECH_API_KEY');
    const paytechApiSecret = Deno.env.get('PAYTECH_API_SECRET');

    if (!paytechApiKey || !paytechApiSecret) {
      console.error('PayTech credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call PayTech API to check payment status
    const paytechResponse = await fetch('https://paytech.sn/api/payment/check', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API_KEY": paytechApiKey,
        "API_SECRET": paytechApiSecret
      },
      body: JSON.stringify({ token })
    });

    if (!paytechResponse.ok) {
      throw new Error(`PayTech API error: ${paytechResponse.status}`);
    }

    const paytechData = await paytechResponse.json();
    
    console.log('PayTech status check:', { token, status: paytechData.status });

    return new Response(
      JSON.stringify({
        success: true,
        status: paytechData.status,
        data: paytechData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment status check error:', error);
    
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