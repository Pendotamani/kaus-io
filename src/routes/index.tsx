import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Sparkles, Shield, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KausLogo } from "@/components/KausLogo";
import { AboutDialog } from "@/components/AboutDialog";
import { KAUS_CONFIG } from "@/lib/kaus-config";
import { useChatStore } from "@/lib/chat-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaus — AI Assistant" },
      {
        name: "description",
        content:
          "Kaus is a fast, thoughtful AI assistant. Continue as guest to start chatting instantly.",
      },
      { property: "og:title", content: "Kaus — AI Assistant" },
      {
        property: "og:description",
        content: "Chat with Kaus instantly. No account required.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [aboutOpen, setAboutOpen] = useState(false);
  const { setGuest } = useChatStore();

  const continueAsGuest = () => {
    setGuest(true);
    navigate({ to: "/chat" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-5 sm:px-8 h-16 border-b border-border">
        <div className="flex items-center gap-2.5">
          <KausLogo size={32} />
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Kaus</div>
            <div className="text-[11px] text-muted-foreground -mt-0.5">AI Assistant</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setAboutOpen(true)} className="gap-1.5">
          <Info className="h-4 w-4" />
          About
        </Button>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10">
        <div className="w-full max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Powered by Gemini
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight font-[var(--font-display)]">
            Meet Kaus
          </h1>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
            A thoughtful AI assistant for ideas, writing, and answers. No sign-up required.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={continueAsGuest}
              className="h-12 px-6 text-base gap-2 shadow-lg"
            >
              Continue as Guest
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setAboutOpen(true)}
              className="h-12 px-6 text-base"
            >
              Learn more
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Your chats are stored locally on this device.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Feature
              icon={<Zap className="h-4 w-4" />}
              title="Instant access"
              body="Start chatting in one click — no account needed."
            />
            <Feature
              icon={<Shield className="h-4 w-4" />}
              title="Private by default"
              body="Guest history stays in your browser."
            />
            <Feature
              icon={<Sparkles className="h-4 w-4" />}
              title="Smart answers"
              body="Multimodal: ask, upload images and files."
            />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-5 border-t border-border">
        Built by {KAUS_CONFIG.creator.name} · v{KAUS_CONFIG.version}
      </footer>

      <AboutDialog open={aboutOpen} onOpenChange={setAboutOpen} />
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="mt-2 text-sm font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{body}</div>
    </div>
  );
}
