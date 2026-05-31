import { Instagram } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KausLogo } from "./KausLogo";
import { KAUS_CONFIG } from "@/lib/kaus-config";

export function AboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <KausLogo size={44} />
            <div>
              <DialogTitle className="text-left">Kaus AI Assistant</DialogTitle>
              <DialogDescription className="text-left">
                Built by {KAUS_CONFIG.creator.name}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ul className="mt-2 space-y-2 text-sm">
          {KAUS_CONFIG.features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {f}
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          {KAUS_CONFIG.creator.achievement}
        </div>

        <Button asChild className="w-full mt-2">
          <a
            href={KAUS_CONFIG.creator.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2"
          >
            <Instagram className="h-4 w-4" />
            Follow Creator
          </a>
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          v{KAUS_CONFIG.version}
        </p>
      </DialogContent>
    </Dialog>
  );
}
