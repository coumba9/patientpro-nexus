import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SharePrescriptionRequest {
  email: string;
  message?: string;
  document_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header for authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { email, message, document_id }: SharePrescriptionRequest = await req.json();

    // Validate input
    if (!email || !document_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email and document_id' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Query the document with RLS - this will automatically verify ownership
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        patient:patient_id(id, birth_date),
        doctor:doctor_id(
          profile:id(first_name, last_name, phone),
          specialty:specialty_id(name)
        )
      `)
      .eq('id', document_id)
      .eq('type', 'prescription')
      .single();

    if (docError || !document) {
      console.error('Document query error:', docError);
      return new Response(
        JSON.stringify({ error: 'Prescription not found or access denied' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify user has access (either patient or doctor)
    if (document.patient_id !== user.id && document.doctor_id !== user.id) {
      console.warn(`Unauthorized access attempt by user ${user.id} to document ${document_id}`);
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse prescription data from document
    const prescription = {
      id: document.id,
      date: document.created_at,
      doctor: `Dr. ${document.doctor?.profile?.first_name} ${document.doctor?.profile?.last_name}`,
      medications: [], // TODO: Parse from document content or related table
      duration: "À compléter",
      signed: document.is_signed,
      patientName: "Patient", // TODO: Get from patient profile
      patientAge: document.patient?.birth_date ? String(new Date().getFullYear() - new Date(document.patient.birth_date).getFullYear()) : "N/A",
      diagnosis: "",
      doctorSpecialty: document.doctor?.specialty?.name || "Médecin généraliste",
      doctorAddress: "Cabinet médical",
    };

    console.log(`User ${user.id} sharing prescription ${document_id} to ${email}`);

    // Générer le contenu HTML de l'ordonnance
    const prescriptionHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb;">
        <!-- En-tête -->
        <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h2 style="margin: 0; font-size: 20px; color: #1f2937;">${prescription.doctor}</h2>
              <p style="margin: 5px 0; color: #6b7280;">${prescription.doctorSpecialty}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">${prescription.doctorAddress}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">Tél: +221 XX XXX XX XX</p>
            </div>
            <div style="text-align: right;">
              <h1 style="margin: 0; font-size: 24px; color: #2563eb; margin-bottom: 10px;">ORDONNANCE</h1>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Date: ${prescription.date}</p>
              ${prescription.signed ? '<span style="display: inline-block; background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; margin-top: 8px;">Ordonnance signée</span>' : ''}
            </div>
          </div>
        </div>

        <!-- Informations du patient -->
        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;">Informations du patient</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <p style="margin: 5px 0;"><strong>Nom:</strong> ${prescription.patientName}</p>
              <p style="margin: 5px 0;"><strong>Âge:</strong> ${prescription.patientAge}</p>
            </div>
            <div>
              <p style="margin: 5px 0;"><strong>Date de consultation:</strong> ${prescription.date}</p>
              ${prescription.diagnosis ? `<p style="margin: 5px 0;"><strong>Diagnostic:</strong> ${prescription.diagnosis}</p>` : ''}
            </div>
          </div>
        </div>

        <!-- Médicaments prescrits -->
        <div style="margin: 20px 0;">
          <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #1f2937;">Prescription médicamenteuse</h3>
          <div style="space-y: 15px;">
            ${prescription.medications.map(med => `
              <div style="border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; background: #eff6ff;">
                <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #1f2937;">${med.name}</h4>
                <p style="margin: 5px 0; color: #374151;"><strong>Dosage:</strong> ${med.dosage}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Posologie:</strong> ${med.frequency}</p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Durée: ${prescription.duration}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Instructions -->
        <div style="background: #fefce8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1f2937;">Instructions importantes</h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li>Respecter scrupuleusement la posologie indiquée</li>
            <li>Terminer le traitement même en cas d'amélioration</li>
            <li>En cas d'effets indésirables, contacter immédiatement votre médecin</li>
            <li>Conserver les médicaments dans un endroit sec et à l'abri de la lumière</li>
          </ul>
        </div>

        ${prescription.signed ? `
          <div style="text-align: right; margin-top: 40px;">
            <p style="margin-bottom: 15px; color: #374151;">Fait le ${prescription.date}</p>
            <div style="border-top: 1px solid #d1d5db; padding-top: 15px; width: 250px; margin-left: auto;">
              <p style="margin: 0; font-weight: bold;">${prescription.doctor}</p>
              <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">Signature et cachet</p>
            </div>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #6b7280;">
            Cette ordonnance est valide pour une durée déterminée. 
            Consultez votre pharmacien pour plus d'informations.
          </p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "MediConnect <onboarding@resend.dev>",
      to: [email],
      subject: `Ordonnance du ${prescription.date} - ${prescription.doctor}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Ordonnance partagée</h1>
          
          ${message ? `
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0; color: #1f2937;">Message personnel :</h3>
              <p style="margin: 0; color: #374151;">${message}</p>
            </div>
          ` : ''}
          
          <p>Bonjour,</p>
          <p>Vous trouverez ci-dessous l'ordonnance du <strong>${prescription.date}</strong> prescrite par <strong>${prescription.doctor}</strong>.</p>
          
          ${prescriptionHTML}
          
          <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #1e40af;">
              <strong>Important :</strong> Cette ordonnance est envoyée à des fins informatives. 
              Pour toute question médicale, consultez directement votre médecin ou pharmacien.
            </p>
          </div>
          
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            Cordialement,<br>
            L'équipe MediConnect
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in share-prescription function:", error);
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