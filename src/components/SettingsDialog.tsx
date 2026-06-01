import { Moon, Sun, Trash2, Instagram, ShieldCheck, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { theme, setTheme, clearAll, logout, isGuest } = useChatStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your Kaus experience.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Row label="Guest Mode">
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="h-3 w-3" /> Active
            </Badge>
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

          <Row label="Theme">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="gap-2"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {theme === "dark" ? "Light" : "Dark"}
            </Button>
          </Row>

          <div className="pt-2 border-t border-border">
            <Button
              variant="destructive"
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
            {isGuest && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 mt-2"
                onClick={() => {
                  logout();
                  toast.success("Signed out of Guest Mode");
                  onOpenChange(false);
                }}
              >
                <LogOut className="h-4 w-4" />
                Exit Guest Mode
              </Button>
            )}
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
