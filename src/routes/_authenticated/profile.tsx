import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, LogOut, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KausLogo } from "@/components/KausLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useChatStore } from "@/lib/chat-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Kaus" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { clearAll } = useChatStore();

  const onLogout = async () => {
    clearAll();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/welcome", replace: true });
  };

  const created = user?.created_at ? new Date(user.created_at).toLocaleString() : "—";
  const phone = user?.phone ? `+${user.phone}` : "—";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center h-14 px-3 border-b border-border">
        <Button asChild variant="ghost" size="icon" aria-label="Back">
          <Link to="/chat">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="ml-2 font-semibold tracking-tight">Profile</h1>
      </header>

      <main className="flex-1 px-5 py-8">
        <div className="mx-auto max-w-md">
          <div className="flex flex-col items-center text-center">
            <KausLogo size={64} className="shadow-lg" />
            <h2 className="mt-4 text-lg font-semibold">{phone}</h2>
            <p className="text-xs text-muted-foreground mt-1">Kaus Account</p>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card divide-y divide-border">
            <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={phone} />
            <Row icon={<Calendar className="h-4 w-4" />} label="Member since" value={created} />
          </div>

          <Button
            variant="destructive"
            className="mt-8 w-full h-11 gap-2"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </main>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  );
}
