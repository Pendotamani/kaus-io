import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Zap, ShieldCheck, Sparkles, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { KausLogo } from "@/components/KausLogo";
import { AboutDialog } from "@/components/AboutDialog";
import { KAUS_CONFIG } from "@/lib/kaus-config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meet Kaus — AI Assistant" },
      {
        name: "description",
        content: "A thoughtful AI assistant for ideas, writing, and answers.",
      },
    ],
  }),
  component: MeetKaus,
});

function MeetKaus() {
  const navigate = useNavigate();
  const [aboutOpen, setAboutOpen] = useState(false);

  const continueAsGuest = () => {
    try {
      localStorage.setItem("kaus-guest", "1");
    } catch {
      /* ignore */
    }
    navigate({ to: "/chat" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md text-center">
          <KausLogo size={72} className="mx-auto shadow-lg" />
          <h1 className="mt-6 text-4xl font-semibold tracking-tight font-[var(--font-display)]">
            Meet Kaus
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            A thoughtful AI assistant for ideas, writing, and answers.
          </p>

          <div className="mt-8 space-y-2.5">
            <Button
              size="lg"
              onClick={continueAsGuest}
              className="h-12 w-full text-base gap-2 shadow-lg"
            >
              Continue as Guest
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setAboutOpen(true)}
              className="h-12 w-full text-base gap-2"
            >
              <Info className="h-4 w-4" />
              Learn More
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Feature
              icon={<Zap className="h-4 w-4" />}
              title="Instant Access"
              body="Start chatting instantly."
            />
            <Feature
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Private by Default"
              body="Chats remain stored locally on your device."
            />
            <Feature
              icon={<Sparkles className="h-4 w-4" />}
              title="Smart Answers"
              body="Ask questions, upload images and files."
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
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="mt-2 text-sm font-medium">{title}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{body}</div>
    </div>
  );
}
