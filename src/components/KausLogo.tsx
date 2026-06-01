import { useState } from "react";
import logo from "@/assets/kaus-logo.jpg";
import { cn } from "@/lib/utils";

export function KausLogo({ className, size = 32 }: { className?: string; size?: number }) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-border shadow-sm shrink-0 flex items-center justify-center",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Kaus"
    >
      {errored ? (
        <span
          className="font-semibold text-primary select-none"
          style={{ fontSize: Math.max(10, size * 0.42) }}
        >
          K
        </span>
      ) : (
        <img
          src={logo}
          alt="Kaus"
          loading="eager"
          decoding="async"
          onError={() => setErrored(true)}
          className="h-full w-full object-cover"
          draggable={false}
        />
      )}
    </div>
  );
}
