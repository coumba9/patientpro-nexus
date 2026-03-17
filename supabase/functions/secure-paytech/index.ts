import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

const extractUserIdFromBearer = (authHeader: string | null): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payload = parts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    return typeof decoded?.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // verify_jwt=true validates token at gateway level; this extracts user id for app-level checks/logging
    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
    const requesterId = extractUserIdFromBearer(authHeader);

    if (!requesterId) {
      return new Response(
        JSON.stringify({ success: 0, message: 'Authentication required' }),
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
        JSON.stringify({ success: 0, message: 'Champs manquants: item_name, item_price, ref_command, command_name, success_url, cancel_url' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get PayTech credentials from environment
    const paytechApiKey = Deno.env.get('PAYTECH_API_KEY');
    const paytechApiSecret = Deno.env.get('PAYTECH_API_SECRET');

    if (!paytechApiKey || !paytechApiSecret) {
      console.error('PayTech credentials not configured');
      return new Response(
        JSON.stringify({ success: 0, message: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Initiating PayTech payment for ref:', ref_command, 'user:', requesterId);

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
      const providerError = await paytechResponse.text();
      console.error('PayTech API error:', paytechResponse.status, providerError);

      return new Response(
        JSON.stringify({
          success: 0,
          message: 'Le service de paiement a rejeté la requête',
          provider_status: paytechResponse.status,
          provider_error: providerError?.slice(0, 400)
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let paytechData: any = null;
    try {
      paytechData = await paytechResponse.json();
    } catch {
      return new Response(
        JSON.stringify({ success: 0, message: 'Réponse invalide du fournisseur de paiement' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('PayTech response received successfully');

    return new Response(
      JSON.stringify(paytechData),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Payment initiation error:', error);

    return new Response(
      JSON.stringify({
        success: 0,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})