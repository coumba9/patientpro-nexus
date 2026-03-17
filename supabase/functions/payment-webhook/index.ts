import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Convert ArrayBuffer to hex string
function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify HMAC signature from payment provider
async function verifySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expectedSig = toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(body)));

  // Support both raw hex and prefixed formats (e.g. "sha256=...")
  const cleanSig = signature.replace(/^sha256=/, '');
  return cleanSig.toLowerCase() === expectedSig.toLowerCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limit by IP
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
  const { allowed, retryAfterMs } = checkRateLimit(`webhook:${clientIP}`, { maxRequests: 30, windowMs: 60_000 });
  if (!allowed) return rateLimitResponse(retryAfterMs);

  try {
    // Read the raw body once for both signature verification and parsing
    const rawBody = await req.text();

    // Verify payment provider signature
    const webhookSecret = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || Deno.env.get('PAYTECH_API_SECRET') || '';
    const signature = req.headers.get('x-paydunya-signature')
      || req.headers.get('x-hub-signature-256')
      || req.headers.get('x-paytech-signature')
      || req.headers.get('x-webhook-signature');

    if (webhookSecret) {
      const valid = await verifySignature(rawBody, signature, webhookSecret);
      if (!valid) {
        console.warn('Payment webhook signature verification failed');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.warn('No webhook secret configured — signature verification skipped');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    let payload: Record<string, unknown>;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = JSON.parse(rawBody);
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      payload = Object.fromEntries(new URLSearchParams(rawBody));
    } else {
      try { payload = JSON.parse(rawBody); } catch { payload = {}; }
    }

    console.log('Payment webhook received:', JSON.stringify(payload));

    // Extract common fields from Paydunya callback
    const status = (payload.status as string)?.toLowerCase() || '';
    const transactionId = (payload.custom_data as Record<string, string>)?.transactionId
      || payload.transactionId as string
      || payload.transaction_id as string
      || '';
    const invoiceToken = payload.token as string || payload.invoice_token as string || '';
    const responseCode = payload.response_code as string || '';

    // Determine if payment was successful
    const isSuccessful = status === 'completed'
      || status === 'successful'
      || responseCode === '00';

    if (!transactionId) {
      console.error('Missing transactionId in webhook payload');
      return new Response(
        JSON.stringify({ error: 'Missing transaction identifier' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing webhook:', { transactionId, status, isSuccessful, invoiceToken });

    // Update appointment payment status based on transaction ID pattern (APT-...)
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('id, patient_id, doctor_id')
      .eq('payment_id', transactionId);

    if (fetchError) {
      console.error('Error fetching appointment:', fetchError);
    }

    if (appointments && appointments.length > 0) {
      const appointment = appointments[0];
      const newPaymentStatus = isSuccessful ? 'paid' : 'failed';

      const { error: updateError } = await supabase
        .from('appointments')
        .update({
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointment.id);

      if (updateError) {
        console.error('Error updating appointment:', updateError);
      } else {
        console.log(`Appointment ${appointment.id} payment status updated to ${newPaymentStatus}`);
      }

      // Update corresponding invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          payment_status: newPaymentStatus,
          payment_date: isSuccessful ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('appointment_id', appointment.id);

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError);
      }

      // Notify patient about payment result
      if (appointment.patient_id) {
        await supabase.from('notifications').insert({
          user_id: appointment.patient_id,
          type: 'payment_update',
          title: isSuccessful ? 'Paiement confirmé' : 'Échec du paiement',
          message: isSuccessful
            ? 'Votre paiement a été confirmé avec succès. Votre rendez-vous est validé.'
            : 'Votre paiement a échoué. Veuillez réessayer ou choisir un autre moyen de paiement.',
          priority: 'high',
          appointment_id: appointment.id,
          metadata: { transactionId, invoiceToken, status },
        });
      }
    } else {
      console.warn('No appointment found for transactionId:', transactionId);
    }

    // Log the webhook event in audit — use a fixed system UUID, not caller-supplied userId
    const SYSTEM_WEBHOOK_UUID = '00000000-0000-0000-0000-000000000000';
    await supabase.from('admin_audit_logs').insert({
      admin_id: SYSTEM_WEBHOOK_UUID,
      action_type: 'payment_webhook',
      table_name: 'appointments',
      record_id: appointments?.[0]?.id || null,
      details: {
        transactionId,
        status,
        isSuccessful,
        invoiceToken,
        received_at: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
