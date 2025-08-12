import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PayTechPaymentConfig {
  amount: number;
  currency: string;
  description: string;
  success_url: string;
  cancel_url: string;
  reference?: string;
  customField?: Record<string, string>;
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
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse payment details
    const { amount, currency, description, success_url, cancel_url, reference, customField }: PayTechPaymentConfig = await req.json();

    // Validate required fields
    if (!amount || !currency || !description || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment fields' }),
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

    // Generate unique transaction ID
    const transactionId = `APPOINTMENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Log payment initiation
    console.log(`Initiating payment for user ${user.id}, amount: ${amount} ${currency}`);

    // In development mode, simulate payment processing
    const isDev = Deno.env.get('DENO_ENV') !== 'production';
    
    if (isDev) {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockToken = `mock-${Date.now()}`;
      const successUrl = new URL(success_url);
      successUrl.searchParams.append('token', mockToken);
      
      console.log('DEV MODE: Simulating successful payment', { transactionId, mockToken });
      
      return new Response(
        JSON.stringify({
          success: true,
          token: mockToken,
          redirect_url: successUrl.toString(),
          transaction_id: transactionId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Production: Call actual PayTech API
    const paytechResponse = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": paytechApiKey,
        "X-API-SECRET": paytechApiSecret
      },
      body: JSON.stringify({
        amount,
        currency,
        description,
        success_url,
        cancel_url,
        reference: reference || transactionId,
        customField
      })
    });

    if (!paytechResponse.ok) {
      throw new Error(`PayTech API error: ${paytechResponse.status}`);
    }

    const paytechData = await paytechResponse.json();
    
    console.log('PayTech response received', { success: paytechData.success, transactionId });

    return new Response(
      JSON.stringify(paytechData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment initiation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Payment initiation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})