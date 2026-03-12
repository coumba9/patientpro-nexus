import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { diagnosis, notes, prescription, patientName, callDuration } = await req.json();

    if (!diagnosis) {
      return new Response(JSON.stringify({ error: "Le diagnostic est requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es un assistant médical IA spécialisé dans la rédaction de synthèses de consultation.
Tu reçois les notes brutes d'un médecin prises pendant une téléconsultation et tu dois produire une synthèse structurée, professionnelle et concise.

Règles:
- Utilise un langage médical professionnel mais accessible
- Structure la synthèse avec des sections claires
- Ne jamais inventer d'informations non présentes dans les notes
- Rédige en français
- Sois concis mais complet
- Formate en markdown`;

    const userPrompt = `Voici les notes de téléconsultation pour le patient ${patientName || "anonyme"}${callDuration ? ` (durée: ${callDuration})` : ""}:

**Diagnostic:** ${diagnosis}
${notes ? `\n**Notes cliniques:** ${notes}` : ""}
${prescription ? `\n**Prescription:** ${prescription}` : ""}

Génère une synthèse structurée de cette consultation avec les sections suivantes:
1. **Motif de consultation** (déduit du diagnostic et des notes)
2. **Examen et observations** (à partir des notes cliniques)
3. **Diagnostic retenu**
4. **Plan de traitement** (à partir de la prescription)
5. **Recommandations** (suggestions pertinentes basées sur le contexte)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques instants." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants. Ajoutez des crédits dans les paramètres." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("consultation-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
