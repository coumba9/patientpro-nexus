import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApproveApplicationRequest {
  applicationId: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role to bypass RLS
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

    const { applicationId, password }: ApproveApplicationRequest = await req.json();

    console.log("Approving application:", applicationId);

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

    // Determine if a user already exists for this email
    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", application.email)
      .maybeSingle();

    if (existingProfileError) {
      console.error("Error checking existing profile:", existingProfileError);
    }

    let userId: string | null = existingProfile?.id ?? null;

    // Create the user account only if it doesn't already exist
    if (!userId) {
      const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: application.email,
        password: password,
        email_confirm: false, // We'll send a custom verification email
        user_metadata: {
          first_name: application.first_name,
          last_name: application.last_name,
          role: 'doctor',
          speciality: application.specialty_id,
          licenseNumber: application.license_number,
          yearsOfExperience: application.years_of_experience
        }
      });

      if (signUpError || !newUser.user) {
        console.error("Error creating user:", signUpError);
        throw new Error(`Failed to create user account: ${signUpError?.message ?? 'Unknown error'}`);
      }

      userId = newUser.user.id;
      console.log("User created successfully:", userId);
    } else {
      console.log("Existing user found for email, using user id:", userId);
    }

    if (!userId) {
      throw new Error("Unable to resolve user id for doctor application");
    }

    // Update application status
    const { error: updateError } = await supabaseAdmin
      .from("doctor_applications")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Error updating application:", updateError);
      throw new Error("Failed to update application status");
    }

    // Ensure doctor role exists for this user
    const { error: roleUpsertError } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: userId, role: "doctor" },
        { onConflict: "user_id,role" }
      );

    if (roleUpsertError) {
      console.error("Error upserting doctor role:", roleUpsertError);
      throw new Error("Failed to update doctor role");
    }

    // Mark doctor as verified so patients can see them and sync profile data
    const { error: doctorUpsertError } = await supabaseAdmin
      .from("doctors")
      .upsert({
        id: userId,
        is_verified: true,
        specialty_id: application.specialty_id,
        license_number: application.license_number,
        years_of_experience: application.years_of_experience
      });

    if (doctorUpsertError) {
      console.error("Error upserting doctor profile:", doctorUpsertError);
      throw new Error("Failed to update doctor profile");
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

    // Send approval email (non bloquant en cas d'erreur d'envoi)
    let emailResponse;
    try {
      emailResponse = await resend.emails.send({
        from: "JàmmSanté <onboarding@resend.dev>",
        to: [application.email],
        subject: "✅ Votre demande d'inscription a été approuvée - JàmmSanté",
        html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Bienvenue chez JàmmSanté !</h1>
              </div>
              <div class="content">
                <p>Bonjour Dr ${application.first_name} ${application.last_name},</p>
                
                <p><strong>Félicitations !</strong> Votre demande d'inscription en tant que médecin sur JàmmSanté a été approuvée.</p>
                
                <div class="info-box">
                  <h3>📋 Vos informations</h3>
                  <p><strong>Spécialité :</strong> ${specialtyName}</p>
                  <p><strong>Numéro de licence :</strong> ${application.license_number}</p>
                  <p><strong>Années d'expérience :</strong> ${application.years_of_experience} ans</p>
                </div>

                <div class="info-box">
                  <h3>🔐 Vos identifiants de connexion</h3>
                  <p><strong>Email :</strong> ${application.email}</p>
                  <p><strong>Mot de passe temporaire :</strong> ${password}</p>
                  <p style="color: #e74c3c; font-size: 14px;">⚠️ Pour des raisons de sécurité, veuillez changer votre mot de passe lors de votre première connexion.</p>
                </div>

                <p style="text-align: center;">
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovableproject.com') || ''}/login" class="button">
                    Se connecter maintenant
                  </a>
                </p>

                <p>Vous pouvez maintenant accéder à toutes les fonctionnalités de la plateforme :</p>
                <ul>
                  <li>Gérer vos rendez-vous</li>
                  <li>Consulter vos patients</li>
                  <li>Créer des dossiers médicaux</li>
                  <li>Effectuer des téléconsultations</li>
                </ul>

                <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
                
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

      console.log("Email sent successfully:", emailResponse);
    } catch (emailError) {
      console.error("Error sending approval email:", emailError);
      // On ne bloque pas l'approbation si l'email échoue
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Application approved",
        userId: newUser.user?.id,
        emailSent: !!emailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in approve-doctor-application:", error);
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
