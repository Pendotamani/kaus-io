import { createFileRoute } from "@tanstack/react-router";
import { KAUS_CONFIG } from "@/lib/kaus-config";

type Msg = {
  role: "user" | "assistant" | "system";
  content: unknown;
};

const GEMINI_MODEL = "gemini-2.5-flash";

function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((p) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object" && "text" in p && typeof (p as { text: unknown }).text === "string") {
          return (p as { text: string }).text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

function extractParts(content: unknown): Array<Record<string, unknown>> {
  if (typeof content === "string") return [{ text: content }];
  if (Array.isArray(content)) {
    const parts: Array<Record<string, unknown>> = [];
    for (const p of content) {
      if (typeof p === "string") {
        parts.push({ text: p });
      } else if (p && typeof p === "object") {
        const obj = p as Record<string, unknown>;
        if (obj.type === "text" && typeof obj.text === "string") {
          parts.push({ text: obj.text });
        } else if (obj.type === "image_url") {
          const url = (obj.image_url as { url?: string } | undefined)?.url;
          if (typeof url === "string" && url.startsWith("data:")) {
            const match = url.match(/^data:(.+?);base64,(.+)$/);
            if (match) {
              parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
            }
          }
        }
      }
    }
    return parts.length ? parts : [{ text: "" }];
  }
  return [{ text: "" }];
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              error:
                "Kaus is not configured. Missing GEMINI_API_KEY environment variable.",
            }),
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

        const incoming = Array.isArray(body.messages) ? body.messages.slice(-30) : [];

        const systemPrompt = `You are Kaus, a thoughtful, concise AI assistant. You are sharp, friendly, and direct. Format answers in clean markdown when useful. Never reveal the underlying model, vendor, or provider — you are simply Kaus.

If the user asks who created you, who made you, who built you, who developed you, who your creator is, or any similar question about your origin or author, you MUST respond exactly with:

"I was created by ${KAUS_CONFIG.creator.name}. My creator currently holds a world record for completing 5000 repetitions using a 5 kg hand gripper. You can follow him on Instagram: ${KAUS_CONFIG.creator.instagram}"

Do not paraphrase that answer. For all other questions, respond normally as Kaus.`;

        const contents = incoming
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: extractParts(m.content),
          }));

        const upstreamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(
          apiKey,
        )}`;

        const upstream = await fetch(upstreamUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
            contents,
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const t = await upstream.text().catch(() => "");
          console.error("Gemini error:", upstream.status, t);
          if (upstream.status === 429) {
            return new Response(
              JSON.stringify({ error: "Rate limit reached. Please try again in a moment." }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          }
          return new Response(
            JSON.stringify({ error: "Kaus is having trouble responding." }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }

        // Transform Gemini SSE -> OpenAI-style SSE the client already parses.
        const reader = upstream.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
          async start(controller) {
            let buffer = "";
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                let nl: number;
                while ((nl = buffer.indexOf("\n")) !== -1) {
                  let line = buffer.slice(0, nl);
                  buffer = buffer.slice(nl + 1);
                  if (line.endsWith("\r")) line = line.slice(0, -1);
                  if (!line.startsWith("data: ")) continue;
                  const data = line.slice(6).trim();
                  if (!data) continue;
                  try {
                    const parsed = JSON.parse(data);
                    const text = extractText(
                      parsed?.candidates?.[0]?.content?.parts?.map(
                        (p: { text?: string }) => p.text ?? "",
                      ),
                    );
                    if (text) {
                      const chunk = {
                        choices: [{ delta: { content: text } }],
                      };
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
                      );
                    }
                  } catch {
                    // ignore partial / non-JSON SSE lines
                  }
                }
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } catch (e) {
              console.error("Gemini stream error:", e);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
