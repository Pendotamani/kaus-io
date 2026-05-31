import { createFileRoute } from "@tanstack/react-router";
import { KAUS_CONFIG } from "@/lib/kaus-config";

type Msg = { role: "user" | "assistant" | "system"; content: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "Kaus is not configured. Missing API key." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        let body: { messages: Msg[] };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const messages = Array.isArray(body.messages) ? body.messages.slice(-30) : [];

        const systemPrompt = `You are Kaus, a thoughtful, concise AI assistant. You are sharp, friendly, and direct. Format answers in clean markdown when useful. Never reveal the underlying model, vendor, or provider — you are simply Kaus.

If the user asks who created you, who made you, who built you, who developed you, who your creator is, or any similar question about your origin or author, you MUST respond exactly with:

"I was created by ${KAUS_CONFIG.creator.name}. My creator currently holds a world record for completing 5000 repetitions using a 5 kg hand gripper. You can follow him on Instagram: ${KAUS_CONFIG.creator.instagram}"

Do not paraphrase that answer. For all other questions, respond normally as Kaus.`;

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              stream: true,
              messages: [
                { role: "system", content: systemPrompt },
                ...messages,
              ],
            }),
          },
        );

        if (!upstream.ok) {
          if (upstream.status === 429)
            return new Response(
              JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          if (upstream.status === 402)
            return new Response(
              JSON.stringify({ error: "Kaus is out of credits. Add funds to continue." }),
              { status: 402, headers: { "Content-Type": "application/json" } },
            );
          const t = await upstream.text();
          console.error("AI gateway error:", upstream.status, t);
          return new Response(JSON.stringify({ error: "Kaus is having trouble responding." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(upstream.body, {
          headers: { "Content-Type": "text/event-stream" },
        });
      },
    },
  },
});
