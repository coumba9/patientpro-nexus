import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const completedStatuses = new Set(['success', 'completed', 'paid', 'sale_complete', 'succeeded', 'approved', 'done'])
const failedStatuses = new Set(['failed', 'cancelled', 'canceled', 'expired', 'rejected', 'error'])

const toLowerStatus = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toLowerCase() : ''

const hasSuccessFlag = (value: unknown): boolean =>
  value === true || value === 1 || value === '1' || value === 'true'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, status: 'unauthorized', error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, status: 'unauthorized', error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return new Response(
        JSON.stringify({ success: false, status: 'invalid_request', error: 'Payment token is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paytechApiKey = Deno.env.get('PAYTECH_API_KEY')
    const paytechApiSecret = Deno.env.get('PAYTECH_API_SECRET')

    if (!paytechApiKey || !paytechApiSecret) {
      console.error('PayTech credentials not configured')
      return new Response(
        JSON.stringify({ success: false, status: 'not_configured', error: 'Payment service not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const verifyUrl = new URL('https://paytech.sn/api/payment/get-status')
    verifyUrl.searchParams.set('token_payment', token)

    console.log('Verifying payment with PayTech API for token:', token)

    const verifyResponse = await fetch(verifyUrl.toString(), {
      method: 'GET',
      headers: {
        'API_KEY': paytechApiKey,
        'API_SECRET': paytechApiSecret,
      },
    })

    const responseText = await verifyResponse.text()
    console.log('PayTech API response status:', verifyResponse.status)
    console.log('PayTech API response:', responseText)

    if (!verifyResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          status: 'verification_failed',
          error: 'Unable to verify payment status with payment provider',
          provider_status_code: verifyResponse.status,
          provider_error: responseText?.slice(0, 300) || null,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let paymentData: any = null
    try {
      paymentData = responseText ? JSON.parse(responseText) : {}
    } catch (e) {
      console.error('Failed to parse PayTech response:', e)
      return new Response(
        JSON.stringify({
          success: false,
          status: 'verification_unavailable',
          error: 'Invalid response from payment provider',
          provider_status_code: verifyResponse.status,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentPayload = paymentData?.payment ?? paymentData?.transaction ?? paymentData
    const providerStatusRaw =
      paymentPayload?.status ??
      paymentPayload?.state ??
      paymentPayload?.payment_status ??
      paymentData?.status ??
      paymentData?.state ??
      paymentData?.payment_status

    const providerStatus = toLowerStatus(providerStatusRaw)

    const paymentCompleted =
      completedStatuses.has(providerStatus) ||
      hasSuccessFlag(paymentPayload?.success) ||
      hasSuccessFlag(paymentData?.success) ||
      hasSuccessFlag(paymentPayload?.paid) ||
      hasSuccessFlag(paymentData?.paid)

    const paymentFailed = failedStatuses.has(providerStatus)

    const normalizedStatus = paymentCompleted
      ? 'completed'
      : paymentFailed
        ? 'failed'
        : 'pending'

    return new Response(
      JSON.stringify({
        success: paymentCompleted,
        verified: paymentCompleted,
        status: normalizedStatus,
        data: {
          token,
          provider_status: providerStatusRaw ?? null,
          provider_status_code: verifyResponse.status,
          checked_at: new Date().toISOString(),
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Payment status check error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        status: 'verification_error',
        error: 'Payment status check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
