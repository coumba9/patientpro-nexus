import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Received chat request with", messages.length, "messages");

    const systemPrompt = `Tu es un assistant virtuel intelligent pour JàmmSanté, une plateforme de prise de rendez-vous médicaux au Sénégal.

Ton rôle est d'aider les patients avec :
- La prise de rendez-vous avec des médecins
- La recherche de spécialistes (cardiologue, dentiste, pédiatre, etc.)
- Les informations sur les téléconsultations
- L'explication du fonctionnement de la plateforme
- Les questions sur les paiements (Wave, Orange Money, Free Money, carte bancaire)
- L'aide pour naviguer sur la plateforme

Directives importantes :
- Sois chaleureux, professionnel et empathique
- Réponds toujours en français
- Sois concis mais informatif
- Si tu ne sais pas quelque chose, propose de rediriger vers le support
- Encourage l'utilisation de la plateforme pour prendre rendez-vous
- Ne donne jamais de conseils médicaux - redirige vers un médecin
- Mentionne les avantages : disponibilité 24/7, 500+ médecins, paiements sécurisés

Pour prendre rendez-vous :
1. Le patient doit d'abord créer un compte ou se connecter
2. Chercher un médecin par spécialité ou nom
3. Choisir un créneau disponible
4. Confirmer et payer

Types de consultation :
- Consultation en cabinet (présentiel)
- Téléconsultation (vidéo)
- Consultation à domicile (selon disponibilité)

Sois proactif et guide le patient étape par étape.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, veuillez réessayer dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporairement indisponible. Veuillez réessayer plus tard." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chatbot error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur est survenue" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
