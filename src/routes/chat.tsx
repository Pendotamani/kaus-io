import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, Sparkles, ShieldCheck, Info, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { PromptInput } from "@/components/PromptInput";
import { KausLogo } from "@/components/KausLogo";
import { AboutDialog } from "@/components/AboutDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import {
  useChatStore,
  makeMessage,
  type Attachment,
  type Message,
} from "@/lib/chat-store";
import { KAUS_CONFIG } from "@/lib/kaus-config";
import { toast } from "sonner";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Kaus" },
      {
        name: "description",
        content: "Chat with Kaus, your thoughtful AI assistant.",
      },
    ],
  }),
  component: KausChat,
});

const SUGGESTIONS = [
  { title: "Explain a concept", prompt: "Explain quantum entanglement like I'm 12." },
  { title: "Write a draft", prompt: "Draft a friendly follow-up email to a new client." },
  { title: "Plan something", prompt: "Plan a 3-day trip to Lisbon for a first-time visitor." },
  { title: "Code help", prompt: "Show me a TypeScript debounce function with tests." },
];

function KausChat() {
  const {
    chats,
    activeId,
    newChat,
    addMessage,
    updateLastAssistant,
    isGuest,
  } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Light theme is enforced app-wide.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Guest state persists in localStorage; refresh keeps the user in chat.
  // The user exits via the Logout button (handled by chat-store.logout()).

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const active = chats.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.messages.length, loading]);

  const send = async (text: string, attachments: Attachment[]) => {
    let chatId = activeId;
    if (!chatId) chatId = newChat();

    const userMsg = makeMessage("user", text, attachments.length ? attachments : undefined);
    addMessage(chatId, userMsg);

    const history = (useChatStore.getState().chats.find((c) => c.id === chatId)?.messages ??
      []) as Message[];

    const apiMessages = history.map((m) => {
      if (m.role === "user" && m.attachments?.some((a) => a.type.startsWith("image/") && a.dataUrl)) {
        const parts: Array<Record<string, unknown>> = [];
        if (m.content) parts.push({ type: "text", text: m.content });
        for (const a of m.attachments) {
          if (a.type.startsWith("image/") && a.dataUrl) {
            parts.push({ type: "image_url", image_url: { url: a.dataUrl } });
          } else {
            parts.push({ type: "text", text: `[Attached file: ${a.name} (${a.type})]` });
          }
        }
        return { role: m.role, content: parts };
      }
      const fileNote =
        m.attachments && m.attachments.length
          ? `\n\n[Attached: ${m.attachments.map((a) => a.name).join(", ")}]`
          : "";
      return { role: m.role, content: (m.content || "") + fileNote };
    });

    addMessage(chatId, makeMessage("assistant", ""));
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: ctrl.signal,
      });

      if (!resp.ok || !resp.body) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody.error || `Request failed (${resp.status})`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              updateLastAssistant(chatId!, acc);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (!acc) {
        updateLastAssistant(chatId!, "I couldn't generate a response. Please try again.");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      if ((e as Error).name === "AbortError") {
        updateLastAssistant(chatId!, "_Response stopped._");
      } else {
        updateLastAssistant(chatId!, `**Error:** ${message}`);
        toast.error(message);
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  const empty = !active || active.messages.length === 0;

  return (
    <div className="h-screen w-full flex bg-background text-foreground">
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-2 px-3 sm:px-6 h-14 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-10">
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden h-9 w-9"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <KausLogo size={28} className="md:hidden" />
            <h1 className="font-semibold tracking-tight truncate">
              {active?.title || "Kaus"}
            </h1>
            {isGuest && (
              <Badge variant="secondary" className="gap-1 ml-1 hidden xs:inline-flex sm:inline-flex">
                <ShieldCheck className="h-3 w-3" /> Guest Mode
              </Badge>
            )}
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setAboutOpen(true)}
              aria-label="About"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </header>

        <div ref={scrollerRef} className="flex-1 overflow-y-auto scroll-thin">
          {empty ? (
            <EmptyState onPick={(p) => send(p, [])} />
          ) : (
            <div className="mx-auto max-w-3xl">
              {active!.messages.map((m, i) => {
                const isLast = i === active!.messages.length - 1;
                return (
                  <ChatMessage
                    key={m.id}
                    message={m}
                    streaming={loading && isLast && m.role === "assistant"}
                  />
                );
              })}
            </div>
          )}
        </div>

        <PromptInput onSend={send} onStop={stop} isLoading={loading} />
      </main>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-6 py-12">
      <KausLogo size={72} className="mb-5 shadow-lg" />
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight font-[var(--font-display)] text-center">
        {KAUS_CONFIG.welcomeMessage}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" /> Ask anything, attach files, get answers.
      </p>
      {KAUS_CONFIG.showCreatorBranding && (
        <p className="mt-1 text-xs text-muted-foreground">
          Created by {KAUS_CONFIG.creator.name}.
        </p>
      )}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-2xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.prompt)}
            className="text-left rounded-xl border border-border bg-card hover:bg-accent transition px-4 py-3"
          >
            <div className="text-sm font-medium">{s.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {s.prompt}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
