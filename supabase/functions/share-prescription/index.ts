import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SharePrescriptionRequest {
  email: string;
  message?: string;
  prescription: {
    id: number;
    date: string;
    doctor: string;
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
    duration: string;
    signed: boolean;
    patientName: string;
    patientAge: string;
    diagnosis?: string;
    doctorSpecialty: string;
    doctorAddress: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, message, prescription }: SharePrescriptionRequest = await req.json();

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