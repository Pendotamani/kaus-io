import { createFileRoute } from "@tanstack/react-router";
import { KAUS_CONFIG } from "@/lib/kaus-config";
import { streamChat, type ORMessage } from "@/services/openrouter";

type Msg = {
  role: "user" | "assistant" | "system";
  content: unknown;
};

function toOpenAIContent(content: unknown): unknown {
  // OpenRouter accepts OpenAI-style content (string OR parts with text/image_url).
  // The client already sends that shape, so pass through.
  return content;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "OpenRouter API key not configured." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        let body: { messages: Msg[]; model?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const incoming = Array.isArray(body.messages) ? body.messages.slice(-30) : [];

        const systemPrompt = `You are Kaus, a thoughtful, concise AI assistant. You are sharp, friendly, and direct. Format answers in clean markdown when useful. Never reveal the underlying model, vendor, or provider — you are simply Kaus.

If the user asks who created you, who made you, who built you, who developed you, who your creator is, or any similar question about your origin or author, you MUST respond exactly with:

"I was created by ${KAUS_CONFIG.creator.name}. My creator currently holds a world record for completing 5000 repetitions using a 5 kg hand gripper. You can follow him on Instagram: ${KAUS_CONFIG.creator.instagram}"

Do not paraphrase that answer. For all other questions, respond normally as Kaus.`;

        const messages: ORMessage[] = [
          { role: "system", content: systemPrompt },
          ...incoming
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role as "user" | "assistant", content: toOpenAIContent(m.content) })),
        ];

        let upstream: Response;
        try {
          upstream = await streamChat({
            apiKey,
            messages,
            model: body.model,
            referer: request.headers.get("origin") ?? undefined,
          });
        } catch (e) {
          console.error("OpenRouter fetch error:", e);
          return new Response(
            JSON.stringify({ error: "Kaus is having trouble responding." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        if (!upstream.ok || !upstream.body) {
          const t = await upstream.text().catch(() => "");
          console.error("OpenRouter error:", upstream.status, t);
          if (upstream.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          }
          if (upstream.status === 401 || upstream.status === 403) {
            return new Response(
              JSON.stringify({ error: "OpenRouter API key not configured." }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
          return new Response(
            JSON.stringify({ error: "Kaus is having trouble responding." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // OpenRouter already streams OpenAI-style SSE — the client parser
        // expects exactly that shape, so pass the body straight through.
        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
