import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { KausLogo } from "@/components/KausLogo";
import { KAUS_CONFIG } from "@/lib/kaus-config";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kaus — AI Assistant" },
      { name: "description", content: "Kaus is a thoughtful AI assistant." },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => {
      if (loading) return;
      navigate({ to: session ? "/chat" : "/welcome", replace: true });
    }, 2200);
    return () => clearTimeout(t);
  }, [session, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-accent/20 text-foreground px-6">
      <div className="animate-in fade-in-50 zoom-in-95 duration-700 flex flex-col items-center">
        <KausLogo size={88} className="shadow-xl" />
        <h1 className="mt-6 text-3xl font-semibold tracking-tight font-[var(--font-display)]">
          Kaus AI
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Created by {KAUS_CONFIG.creator.name}
        </p>
        <Loader2 className="mt-8 h-5 w-5 animate-spin text-muted-foreground" />
      </div>
      <p className="absolute bottom-6 text-[11px] text-muted-foreground">v{KAUS_CONFIG.version}</p>
    </div>
  );
}
