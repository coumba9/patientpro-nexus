import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  phoneNumber?: string;
  message: string;
  userId: string;
  signature?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message, userId, signature = 'JàmmSanté' }: SMSRequest = await req.json();

    console.log('SMS Request:', { phoneNumber, message, userId, signature });

    if (!message || !userId) {
      throw new Error('Missing required fields: message or userId');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Format phone number (ensure it starts with country code)
    let formattedPhone = phoneToUse.replace(/\s/g, '');
    if (!formattedPhone.startsWith('221') && !formattedPhone.startsWith('+221')) {
      formattedPhone = '221' + formattedPhone;
    }
    formattedPhone = formattedPhone.replace('+', '');

    console.log('Formatted phone:', formattedPhone);

    // Send SMS using Dexchange API
    const dexchangeResponse = await fetch('https://api.dexchange-sms.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        number: [formattedPhone],
        signature: signature,
        content: message
      })
    });

    console.log('Dexchange Response Status:', dexchangeResponse.status);
    
    let responseData;
    const contentType = dexchangeResponse.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await dexchangeResponse.json();
    } else {
      const textResponse = await dexchangeResponse.text();
      console.log('Non-JSON Response:', textResponse);
      responseData = { error: 'Invalid API response', details: textResponse.substring(0, 200) };
    }
    
    console.log('Dexchange API Response:', responseData);

    const success = dexchangeResponse.ok;

    // Log SMS attempt in database
    const statusCode = dexchangeResponse.status;
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
