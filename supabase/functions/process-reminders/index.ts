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

    // Get current time
    const now = new Date();
    
    console.log('Processing reminders at:', now.toISOString());

    // Get pending reminders that should be sent now
    const { data: reminders, error: remindersError } = await supabase
      .from('reminders')
      .select(`
        *,
        appointment:appointment_id (
          id,
          date,
          time,
          patient_id,
          doctor_id,
          type,
          mode,
          doctor:doctor_id (
            profile:id (first_name, last_name)
          )
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now.toISOString())
      .lt('attempts', 3);

    if (remindersError) {
      throw remindersError;
    }

    console.log(`Found ${reminders?.length || 0} reminders to process`);

    for (const reminder of reminders || []) {
      try {
        const appointment = reminder.appointment;
        
        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: reminder.patient_id,
            type: 'reminder',
            title: 'Rappel de rendez-vous',
            message: `Rappel: Vous avez un rendez-vous le ${appointment.date} à ${appointment.time}`,
            appointment_id: reminder.appointment_id,
            priority: 'high',
            is_read: false
          });

        // Update reminder status
        await supabase
          .from('reminders')
          .update({
            status: 'sent',
            attempts: reminder.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);

        console.log(`Reminder sent for appointment ${reminder.appointment_id}`);
      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        
        // Update attempts count
        await supabase
          .from('reminders')
          .update({
            attempts: reminder.attempts + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', reminder.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: reminders?.length || 0,
        message: 'Reminders processed successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Process reminders error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process reminders',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});