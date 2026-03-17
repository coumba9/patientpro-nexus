import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { escapeHtml } from '../_shared/htmlEscape.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailRequest {
  appointmentId: string;
  patientEmail: string;
  doctorName: string;
  specialtyName: string;
  date: string;
  time: string;
  mode: string;
  location?: string;
  type: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      appointmentId,
      patientEmail, 
      doctorName, 
      specialtyName,
      date,
      time,
      mode,
      location,
      type
    }: TicketEmailRequest = await req.json();

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
