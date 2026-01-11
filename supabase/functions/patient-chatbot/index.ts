import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Unauthorized request: missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Non autorisé. Veuillez vous connecter." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user with Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log("Authentication failed:", claimsError?.message);
      return new Response(
        JSON.stringify({ error: "Session expirée. Veuillez vous reconnecter." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;
    console.log("Authenticated user:", userId);

    // Rate limiting per user
    if (!checkRateLimit(userId)) {
      console.log("Rate limit exceeded for user:", userId);
      return new Response(
        JSON.stringify({ error: "Trop de requêtes. Veuillez patienter quelques instants." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();

    // Input validation
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Format de message invalide." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate message length to prevent large payloads
    const totalLength = messages.reduce((acc: number, msg: { content?: string }) => 
      acc + (msg.content?.length || 0), 0);
    if (totalLength > 10000) {
      return new Response(
        JSON.stringify({ error: "Message trop long." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing chat request for user:", userId, "with", messages.length, "messages");

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
