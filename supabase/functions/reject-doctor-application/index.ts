import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RejectApplicationRequest {
  applicationId: string;
  reason: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the user is authenticated and is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      throw new Error("Unauthorized: Admin access required");
    }

    const { applicationId, reason }: RejectApplicationRequest = await req.json();

    console.log("Rejecting application:", applicationId);

    // Get application details
    const { data: application, error: appError } = await supabaseAdmin
      .from("doctor_applications")
      .select("*")
      .eq("id", applicationId)
      .eq("status", "pending")
      .single();

    if (appError || !application) {
      throw new Error("Application not found or already processed");
    }

    // Update application status
    const { error: updateError } = await supabaseAdmin
      .from("doctor_applications")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Error updating application:", updateError);
      throw new Error("Failed to update application status");
    }

    // Get specialty name
    let specialtyName = "Médecin";
    if (application.specialty_id) {
      const { data: specialty } = await supabaseAdmin
        .from("specialties")
        .select("name")
        .eq("id", application.specialty_id)
        .single();
      
      if (specialty) {
        specialtyName = specialty.name;
      }
    }

    // Send rejection email
    const emailResponse = await resend.emails.send({
      from: "JàmmSanté <onboarding@resend.dev>",
      to: [application.email],
      subject: "❌ Votre demande d'inscription - JàmmSanté",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .info-box { background: white; padding: 15px; border-left: 4px solid #e74c3c; margin: 20px 0; }
              .reason-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Mise à jour de votre demande</h1>
              </div>
              <div class="content">
                <p>Bonjour ${application.first_name} ${application.last_name},</p>
                
                <p>Nous vous remercions de l'intérêt que vous portez à JàmmSanté et d'avoir pris le temps de soumettre votre demande d'inscription en tant que médecin.</p>
                
                <div class="info-box">
                  <h3>📋 Informations de votre demande</h3>
                  <p><strong>Spécialité :</strong> ${specialtyName}</p>
                  <p><strong>Numéro de licence :</strong> ${application.license_number}</p>
                  <p><strong>Années d'expérience :</strong> ${application.years_of_experience} ans</p>
                </div>

                <p>Après examen attentif de votre dossier, nous sommes au regret de vous informer que nous ne pouvons pas donner suite favorable à votre demande pour le moment.</p>

                <div class="reason-box">
                  <h3>📝 Motif du refus</h3>
                  <p>${reason}</p>
                </div>

                <p><strong>Que faire maintenant ?</strong></p>
                <ul>
                  <li>Vérifiez que toutes les informations fournies sont exactes et complètes</li>
                  <li>Assurez-vous que vos documents justificatifs sont valides</li>
                  <li>Vous pouvez soumettre une nouvelle demande après avoir corrigé les points mentionnés</li>
                </ul>

                <p style="text-align: center;">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com') || ''}/register?type=doctor" class="button">
                    Soumettre une nouvelle demande
                  </a>
                </p>

                <p>Si vous avez des questions concernant cette décision ou si vous souhaitez obtenir plus d'informations, n'hésitez pas à nous contacter.</p>
                
                <p>Nous vous remercions de votre compréhension.</p>
                
                <p>Cordialement,<br><strong>L'équipe JàmmSanté</strong></p>
              </div>
              <div class="footer">
                <p>© 2024 JàmmSanté - Plateforme de santé digitale</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Rejection email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Application rejected and email sent" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in reject-doctor-application:", error);
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
