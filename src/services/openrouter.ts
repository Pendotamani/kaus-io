// Server-only OpenRouter client. Never import from browser code.
// Default model is easy to swap by passing `model` to streamChat().

export const DEFAULT_MODEL = "openai/gpt-oss-120b";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type ORMessage = {
  role: "system" | "user" | "assistant";
  content: unknown;
};

export type StreamChatOptions = {
  apiKey: string;
  messages: ORMessage[];
  model?: string;
  referer?: string;
  title?: string;
  signal?: AbortSignal;
};

/**
 * Calls OpenRouter chat completions in streaming mode and returns the raw
 * SSE Response. The caller is responsible for piping the body to the client.
 */
export async function streamChat(opts: StreamChatOptions): Promise<Response> {
  const {
    apiKey,
    messages,
    model = DEFAULT_MODEL,
    referer,
    title = "Kaus",
    signal,
  } = opts;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": title,
  };
  if (referer) headers["HTTP-Referer"] = referer;

  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, stream: true }),
    signal,
  });
}
