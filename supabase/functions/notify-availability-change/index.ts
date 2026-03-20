import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create client with user's token to verify identity
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { changeType, details } = await req.json();

    // Use service role to insert notifications for admins
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get doctor name
    const { data: profile } = await adminClient
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();

    const doctorName = profile ? `Dr. ${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Un médecin';

    // Get admin user IDs
    const { data: adminRoles } = await adminClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No admins to notify' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const notifications = adminRoles.map(admin => ({
      user_id: admin.user_id,
      type: 'availability_change',
      title: 'Modification de disponibilité',
      message: `${doctorName} a ${changeType} ses disponibilités : ${details}`,
      priority: 'medium',
    }));

    const { error: insertError } = await adminClient.from('notifications').insert(notifications);
    if (insertError) {
      console.error('Error inserting notifications:', insertError);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
