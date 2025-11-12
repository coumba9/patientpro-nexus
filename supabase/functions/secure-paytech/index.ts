import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PayTechPaymentConfig {
  item_name: string;
  item_price: number;
  ref_command: string;
  command_name: string;
  currency?: string;
  env?: string;
  ipn_url?: string;
  success_url: string;
  cancel_url: string;
  custom_field?: string;
  target_payment?: string;
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
    const { 
      item_name, 
      item_price, 
      ref_command, 
      command_name, 
      currency = "XOF",
      env = "test",
      success_url, 
      cancel_url, 
      custom_field,
      target_payment,
      ipn_url
    }: PayTechPaymentConfig = await req.json();

    // Validate required fields
    if (!item_name || !item_price || !ref_command || !command_name || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment fields: item_name, item_price, ref_command, command_name, success_url, cancel_url' }),
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
    
    console.log(`Initiating PayTech payment: item=${item_name}, price=${item_price} ${currency}`);

    // Production: Call actual PayTech API
    const paytechResponse = await fetch("https://paytech.sn/api/payment/request-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API_KEY": paytechApiKey,
        "API_SECRET": paytechApiSecret
      },
      body: JSON.stringify({
        item_name,
        item_price,
        currency,
        ref_command,
        command_name,
        env,
        success_url,
        cancel_url,
        custom_field,
        target_payment,
        ipn_url
      })
    });

    if (!paytechResponse.ok) {
      const errorText = await paytechResponse.text();
      console.error(`PayTech API error: ${paytechResponse.status}`, errorText);
      throw new Error(`PayTech API error: ${paytechResponse.status} - ${errorText}`);
    }

    const paytechData = await paytechResponse.json();
    
    console.log('PayTech response received successfully');

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