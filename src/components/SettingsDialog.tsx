import { Trash2, Instagram, LogOut, CheckCircle2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/chat-store";
import { KAUS_CONFIG } from "@/lib/kaus-config";
import { toast } from "sonner";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { clearAll } = useChatStore();
  const navigate = useNavigate();

  const exitGuest = () => {
    if (!confirm("Exit Guest Mode? This clears your local chat history.")) return;
    try {
      clearAll();
      localStorage.removeItem("kaus-guest");
      localStorage.removeItem("kaus-chat-v2");
    } catch {
      /* ignore */
    }
    onOpenChange(false);
    toast.success("Exited Guest Mode");
    navigate({ to: "/", replace: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your Kaus experience.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Row label="Guest Mode">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Active
            </span>
          </Row>

          <Row label="Creator">
            <a
              href={KAUS_CONFIG.creator.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-foreground hover:underline"
            >
              <Instagram className="h-3.5 w-3.5" />
              {KAUS_CONFIG.creator.name}
            </a>
          </Row>

          <Row label="App Version">
            <span className="text-sm text-muted-foreground">v{KAUS_CONFIG.version}</span>
          </Row>

          <div className="pt-2 border-t border-border space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                if (confirm("Clear all chat history? This cannot be undone.")) {
                  clearAll();
                  toast.success("Chat history cleared");
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Clear Chat History
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={exitGuest}
            >
              <LogOut className="h-4 w-4" />
              Exit Guest Mode
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-medium">{label}</div>
      {children}
    </div>
  );
}
