import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, FileText, Image as ImageIcon, Copy, Check, RefreshCw } from "lucide-react";
import { KausLogo } from "./KausLogo";
import type { Message } from "@/lib/chat-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ChatMessage({
  message,
  streaming,
  onRegenerate,
}: {
  message: Message;
  streaming?: boolean;
  onRegenerate?: () => void;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <div className={cn("group flex gap-3 sm:gap-4 px-3 sm:px-6 py-5", !isUser && "bg-muted/30")}>
      <div className="shrink-0 pt-0.5">
        {isUser ? (
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground">
            <User className="h-4 w-4" />
          </div>
        ) : (
          <KausLogo size={32} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {isUser ? "You" : "Kaus"}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((a) =>
              a.type.startsWith("image/") && a.dataUrl ? (
                <a key={a.id} href={a.dataUrl} target="_blank" rel="noreferrer">
                  <img
                    src={a.dataUrl}
                    alt={a.name}
                    className="max-h-48 rounded-lg border border-border object-cover"
                  />
                </a>
              ) : (
                <div
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                >
                  {a.type.startsWith("image/") ? (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate max-w-[180px]">{a.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(a.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}
        <div className="prose-chat text-[15px] text-foreground">
          {message.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          ) : streaming ? (
            <span className="inline-flex gap-1 items-center h-5">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            </span>
          ) : null}
          {streaming && message.content && (
            <span className="inline-block w-1.5 h-4 align-middle bg-foreground/70 ml-0.5 animate-pulse" />
          )}
        </div>
        {!isUser && !streaming && message.content && (
          <div className="mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label="Copy message"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                aria-label="Regenerate response"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
