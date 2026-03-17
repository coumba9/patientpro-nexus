import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WHATSAPP_RATE_LIMIT = { maxRequests: 5, windowMs: 60_000 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN");
    const PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    // Webhook verification (GET request from WhatsApp)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("Webhook verified successfully");
        return new Response(challenge, { status: 200 });
      } else {
        return new Response("Verification failed", { status: 403 });
      }
    }

    // Handle incoming WhatsApp messages (POST request)
    if (req.method === "POST") {
      const body = await req.json();
      console.log("WhatsApp webhook received, entries:", body.entry?.length ?? 0);

      // Check if it's a message
      if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) {
        const message = body.entry[0].changes[0].value.messages[0];
        const from = message.from; // sender's phone number
        const messageBody = message.text?.body || "";

        // Log only metadata, not message content
        console.log(`WhatsApp message from ${from.substring(0, 4)}***, length: ${messageBody.length}`);

        // Rate limit per phone number
        const { allowed, retryAfterMs } = checkRateLimit(`wa:${from}`, WHATSAPP_RATE_LIMIT);
        if (!allowed) {
          console.log(`Rate limited phone ${from.substring(0, 4)}***`);
          return rateLimitResponse(retryAfterMs);
        }

        // Get AI response using Lovable AI
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `Tu es l'assistant WhatsApp de JàmmSanté. Réponds de manière concise (max 300 caractères) et professionnelle en français. Aide avec les rendez-vous médicaux, la recherche de médecins et les informations sur la plateforme.`
              },
              { role: "user", content: messageBody }
            ],
            temperature: 0.7,
          }),
        });

        const aiData = await aiResponse.json();
        const replyText = aiData.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.";

        // Send reply via WhatsApp Business API
        const whatsappResponse = await fetch(
          `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              text: { body: replyText },
            }),
          }
        );

        if (!whatsappResponse.ok) {
          console.error("WhatsApp API error, status:", whatsappResponse.status);
        } else {
          console.log("Reply sent successfully");
        }
      }

      return new Response(JSON.stringify({ status: "received" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error instanceof Error ? error.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
