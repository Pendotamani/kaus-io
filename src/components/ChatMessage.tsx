import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, FileText, Image as ImageIcon } from "lucide-react";
import { KausLogo } from "./KausLogo";
import type { Message } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export function ChatMessage({ message, streaming }: { message: Message; streaming?: boolean }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3 sm:gap-4 px-3 sm:px-6 py-5", !isUser && "bg-muted/30")}>
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
      </div>
    </div>
  );
}
