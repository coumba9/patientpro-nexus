import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { escapeHtml } from '../_shared/htmlEscape.ts';
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimit.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  appointmentId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    const callerId = claimsData?.claims?.sub as string | undefined;
    if (claimsError || !callerId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rl = checkRateLimit(`send-ticket-email:${callerId}`, { maxRequests: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      const r = rateLimitResponse(rl.retryAfterMs);
      return new Response(r.body, { status: 429, headers: { ...corsHeaders, ...Object.fromEntries(r.headers) } });
    }

    const { appointmentId }: TicketEmailRequest = await req.json();
    if (!appointmentId) {
      return new Response(JSON.stringify({ error: "appointmentId requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load the appointment and verify the caller is involved (data sourced from DB, not the request body)
    const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: appointment, error: apptError } = await admin
      .from("appointments")
      .select("id, patient_id, doctor_id, date, time, mode, type, location, specialty_id")
      .eq("id", appointmentId)
      .single();

    if (apptError || !appointment) {
      return new Response(JSON.stringify({ error: "Rendez-vous introuvable" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (appointment.patient_id !== callerId && appointment.doctor_id !== callerId) {
      return new Response(JSON.stringify({ error: "Accès refusé" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve patient email, doctor name and specialty from the database
    const [{ data: patientProfile }, { data: doctorProfile }] = await Promise.all([
      admin.from("profiles").select("email, first_name, last_name").eq("id", appointment.patient_id).single(),
      admin.from("profiles").select("first_name, last_name").eq("id", appointment.doctor_id).single(),
    ]);

    let specialtyName = "";
    if (appointment.specialty_id) {
      const { data: specialty } = await admin
        .from("specialties").select("name").eq("id", appointment.specialty_id).single();
      specialtyName = specialty?.name ?? "";
    }

    const patientEmail = patientProfile?.email;
    if (!patientEmail) {
      return new Response(JSON.stringify({ error: "Email du patient introuvable" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const doctorName = `Dr. ${doctorProfile?.first_name ?? ""} ${doctorProfile?.last_name ?? ""}`.trim();
    const date = appointment.date ?? "";
    const time = appointment.time ?? "";
    const mode = appointment.mode ?? "";
    const location = appointment.location ?? "";
    const type = appointment.type ?? "";

    console.log("Sending ticket email to:", patientEmail);

    const modeText = mode === 'teleconsultation' ? 'Téléconsultation' : 'Consultation en personne';
    const safeDoctorName = escapeHtml(doctorName);
    const safeSpecialtyName = escapeHtml(specialtyName);
    const safeLocation = escapeHtml(location);
    const safeDate = escapeHtml(date);
    const safeTime = escapeHtml(time);
    const safeType = escapeHtml(type);
    const safeAppointmentId = escapeHtml(appointmentId);

    const emailResponse = await resend.emails.send({
      from: "Medical Appointment <onboarding@resend.dev>",
      to: [patientEmail],
      subject: `Ticket de rendez-vous - ${safeDoctorName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .ticket-container {
                border: 2px solid #0ea5e9;
                border-radius: 8px;
                padding: 30px;
                background-color: #f8fafc;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e2e8f0;
              }
              .header h1 {
                color: #0ea5e9;
                margin: 0 0 10px 0;
              }
              .info-section {
                margin: 20px 0;
              }
              .info-row {
                margin: 15px 0;
                padding: 10px;
                background-color: white;
                border-radius: 4px;
              }
              .info-label {
                font-weight: bold;
                color: #0ea5e9;
              }
              .qr-section {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #e2e8f0;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #64748b;
              }
            </style>
          </head>
          <body>
            <div class="ticket-container">
              <div class="header">
                <h1>🎫 Ticket de Rendez-vous</h1>
                <p>Votre rendez-vous médical est confirmé</p>
              </div>

              <div class="info-section">
                <div class="info-row">
                   <span class="info-label">Médecin:</span> ${safeDoctorName}
                 </div>
                 <div class="info-row">
                   <span class="info-label">Spécialité:</span> ${safeSpecialtyName}
                 </div>
                 <div class="info-row">
                   <span class="info-label">Date:</span> ${safeDate}
                 </div>
                 <div class="info-row">
                   <span class="info-label">Heure:</span> ${safeTime}
                 </div>
                 <div class="info-row">
                   <span class="info-label">Type:</span> ${safeType}
                 </div>
                 <div class="info-row">
                   <span class="info-label">Mode:</span> ${modeText}
                 </div>
                 ${safeLocation ? `<div class="info-row"><span class="info-label">Lieu:</span> ${safeLocation}</div>` : ''}
              </div>

              <div class="qr-section">
                <p><strong>ID du rendez-vous (pour check-in):</strong></p>
                <p style="font-family: monospace; font-size: 14px; background-color: white; padding: 10px; border-radius: 4px; display: inline-block;">
                  ${safeAppointmentId}
                </p>
              </div>

              <div class="footer">
                <p>Veuillez présenter ce ticket lors de votre rendez-vous.</p>
                <p>En cas de questions, veuillez contacter votre médecin.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-ticket-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
