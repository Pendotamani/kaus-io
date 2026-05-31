import logo from "@/assets/kaus-logo.jpg";
import { cn } from "@/lib/utils";

export function KausLogo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-background ring-1 ring-border shadow-sm shrink-0",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <img
        src={logo}
        alt="Kaus"
        loading="eager"
        decoding="async"
        className="h-full w-full object-cover dark:invert"
        style={{ filter: "contrast(1.05)" }}
      />
    </div>
  );
}
