// ============= Full file contents =============

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phoneNumber?: string;
  message: string;
  userId?: string;
  // Signature (Sender ID) shown on the recipient's phone. Custom signatures
  // must be validated on the Dexchange dashboard (requires NINEA/RCCM). The
  // default signatures — DEXCHANGE, DSMS SN, DSMS — need no validation, so we
  // fall back to DEXCHANGE when none is provided.
  signature?: string;
}

// Default sender ID that requires NO NINEA/RCCM validation on Dexchange.
// Allow override via DEXCHANGE_SENDER_ID for when a custom signature is later
// approved on the dashboard.
const DEFAULT_SIGNATURE = Deno.env.get('DEXCHANGE_SENDER_ID')?.trim() || 'DEXCHANGE';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Determine the caller: either an authenticated user (JWT) or an internal
    // service-to-service call (process-reminders) using the service role key.
    const authHeader = req.headers.get('Authorization') ?? '';
    const bearer = authHeader.replace('Bearer ', '');
    const isServiceCall = bearer === serviceKey;

    let authenticatedUserId: string | null = null;
    if (!isServiceCall) {
      if (!authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(bearer);
      if (claimsError || !claimsData?.claims?.sub) {
        return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
          status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      authenticatedUserId = claimsData.claims.sub as string;

      const rl = checkRateLimit(`send-sms:${authenticatedUserId}`, { maxRequests: 5, windowMs: 60_000 });
      if (!rl.allowed) {
        const r = rateLimitResponse(rl.retryAfterMs);
        return new Response(r.body, { status: 429, headers: { ...corsHeaders, ...Object.fromEntries(r.headers) } });
      }
    }

    const { phoneNumber, message, userId: bodyUserId, signature }: SMSRequest = await req.json();

    // For end-user calls, force userId to the verified identity (never trust the body).
    // For internal service calls, the body userId is trusted.
    const userId = isServiceCall ? bodyUserId : authenticatedUserId;

    // Resolve signature: use provided value only if it is a known-valid default
    // signature; otherwise fall back to DEFAULT_SIGNATURE so we never send an
    // unvalidated custom Sender ID (which Dexchange rejects with 400/403).
    const validDefaults = ['DEXCHANGE', 'DSMS SN', 'DSMS'];
    const resolvedSignature =
      signature && validDefaults.includes(signature.trim())
        ? signature.trim()
        : DEFAULT_SIGNATURE;

    console.log('SMS Request:', { phoneNumber, message, userId, signature: resolvedSignature, isServiceCall });

    if (!message || !userId) {
      throw new Error('Missing required fields: message or userId');
    }

    // Initialize Supabase client with service role for DB writes
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get DEXCHANGE API Key
    const apiKey = Deno.env.get('DEXCHANGE_API_KEY');
    if (!apiKey) {
      throw new Error('DEXCHANGE_API_KEY not configured');
    }

    // Resolve phone number: request -> patients -> profiles
    let phoneToUse = phoneNumber || '';

    if (!phoneToUse) {
      const { data: patient, error: patErr } = await supabase
        .from('patients')
        .select('phone_number')
        .eq('id', userId)
        .single();
      if (patErr) console.warn('Patient lookup error:', patErr);
      if (patient?.phone_number) phoneToUse = patient.phone_number;
    }

    if (!phoneToUse) {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', userId)
        .single();
      if (profErr) console.warn('Profile lookup error:', profErr);
      if (profile?.phone_number) phoneToUse = profile.phone_number;
    }

    if (!phoneToUse) {
      return new Response(JSON.stringify({ success: false, error: 'No phone number found for user' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Format phone number to international format without the leading "+".
    // Dexchange requires e.g. "221771234567".
    let formattedPhone = phoneToUse.replace(/\s/g, '');
    formattedPhone = formattedPhone.replace(/\+/g, '');
    if (!formattedPhone.startsWith('221')) {
      // Strip a leading 0 (local Senegal format) then prepend the country code.
      formattedPhone = '221' + formattedPhone.replace(/^0/, '');
    }

    console.log('Formatted phone:', formattedPhone);

    // Send SMS using the Dexchange API (v1) — documented endpoint.
    //   POST https://api.dexchange-sms.com/api/v1/send/sms
    //   Authorization: Bearer <key>
    //   body: { signature, content, number: ["221..."] }
    const endpoint = 'https://api.dexchange-sms.com/api/v1/send/sms';

    const cleanKey = apiKey.trim();
    console.log('Dexchange key meta:', { length: cleanKey.length, prefix: cleanKey.slice(0, 4) });

    // Dexchange rejects any Sender ID that is not approved for the account with
    // HTTP 400 "Signature non vérifiée ou invalide". The default signatures
    // (DEXCHANGE, DSMS SN, DSMS) need no NINEA/RCCM validation, but only the one
    // actually assigned to the account will be accepted. Try the requested
    // signature first, then fall back through the other defaults.
    const signatureCandidates = [
      resolvedSignature,
      ...validDefaults.filter((s) => s !== resolvedSignature),
    ];

    const endpoint = 'https://api.dexchange-sms.com/api/v1/send/sms';

    let dexchangeResponse!: Response;
    let responseData: any = null;
    let statusCode = 0;
    let success = false;
    let usedSignature = resolvedSignature;

    for (const sig of signatureCandidates) {
      const payload = {
        signature: sig,
        content: message,
        number: [formattedPhone],
      };

      dexchangeResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${cleanKey}`,
        },
        body: JSON.stringify(payload),
      });

      statusCode = dexchangeResponse.status;
      const contentType = dexchangeResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await dexchangeResponse.json();
      } else {
        const textResponse = await dexchangeResponse.text();
        responseData = { error: 'Invalid API response', details: textResponse.substring(0, 200) };
      }

      console.log('Dexchange attempt:', { signature: sig, statusCode, responseData });

      success = dexchangeResponse.ok;
      if (success) {
        usedSignature = sig;
        break;
      }

      // Signature not approved for this account -> try the next candidate.
      // Anything else (insufficient balance, auth, etc.) is not a signature
      // problem, so stop retrying.
      const sigRejected =
        statusCode === 400 &&
        typeof responseData?.message === 'string' &&
        /signature/i.test(responseData.message);
      if (!sigRejected) break;
    }

    console.log('Dexchange final:', { success, usedSignature, statusCode, responseData });

    // Log SMS attempt in database
    const logStatus = success ? 'sent' : (statusCode === 521 ? 'provider_down' : 'failed');

    const { error: logError } = await supabase
      .from('sms_logs')
      .insert({
        user_id: userId,
        phone_number: formattedPhone,
        message: message,
        status: logStatus,
        provider_response: responseData,
        sent_at: success ? new Date().toISOString() : null
      });

    if (logError) {
      console.error('Error logging SMS:', logError);
    }

    if (!success) {
      // Do not throw — return a 200 so the client can handle gracefully
      return new Response(
        JSON.stringify({
          success: false,
          error: statusCode === 521 ? 'SMS provider unavailable (521)' : 'SMS sending failed',
          provider_status: statusCode,
          provider_response: responseData
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SMS sent successfully',
        data: responseData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error in send-sms function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
