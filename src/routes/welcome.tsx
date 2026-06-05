import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Phone, Shield, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KausLogo } from "@/components/KausLogo";
import { KAUS_CONFIG } from "@/lib/kaus-config";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — Kaus" }] }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate({ to: "/chat", replace: true });
  }, [session, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md text-center">
          <KausLogo size={64} className="mx-auto shadow-lg" />
          <h1 className="mt-6 text-4xl font-semibold tracking-tight font-[var(--font-display)]">
            Kaus AI
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Your intelligent AI assistant.
          </p>

          <div className="mt-8">
            <Button
              size="lg"
              onClick={() => navigate({ to: "/auth" })}
              className="h-12 w-full text-base gap-2 shadow-lg"
            >
              <Phone className="h-4 w-4" />
              Continue with Phone Number
              <ArrowRight className="h-4 w-4 ml-auto" />
            </Button>
            <p className="mt-3 text-xs text-muted-foreground">
              We'll send a one-time code to verify your number.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-2 text-left">
            <Feature icon={<Zap className="h-4 w-4" />} title="Fast" />
            <Feature icon={<Shield className="h-4 w-4" />} title="Private" />
            <Feature icon={<Sparkles className="h-4 w-4" />} title="Smart" />
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-muted-foreground py-5 border-t border-border">
        Built by {KAUS_CONFIG.creator.name} · v{KAUS_CONFIG.version}
      </footer>
    </div>
  );
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 text-center">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="mt-1.5 text-xs font-medium">{title}</div>
    </div>
  );
}
