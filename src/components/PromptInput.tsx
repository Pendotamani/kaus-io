import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { ArrowUp, Paperclip, Square, X, Image as ImageIcon, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/lib/chat-store";

const MAX_FILE_MB = 10;
const ACCEPTED = ".pdf,.docx,.txt,image/*";

type Props = {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export function PromptInput({ onSend, onStop, isLoading, disabled }: Props) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const autoSize = () => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 240) + "px";
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const next: Attachment[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        alert(`${f.name} is larger than ${MAX_FILE_MB}MB`);
        continue;
      }
      const att: Attachment = {
        id: Math.random().toString(36).slice(2, 10),
        name: f.name,
        type: f.type || "application/octet-stream",
        size: f.size,
      };
      if (f.type.startsWith("image/")) {
        att.dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(r.result as string);
          r.onerror = reject;
          r.readAsDataURL(f);
        });
      }
      next.push(att);
    }
    setAttachments((p) => [...p, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isLoading || disabled) return;
    onSend(trimmed, attachments);
    setText("");
    setAttachments([]);
    requestAnimationFrame(autoSize);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-3 sm:px-6 pb-4 pt-2 bg-gradient-to-t from-background via-background to-background/0">
      <div className="mx-auto max-w-3xl">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((a) => (
              <div
                key={a.id}
                className="group relative flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs"
              >
                {a.type.startsWith("image/") && a.dataUrl ? (
                  <img src={a.dataUrl} alt="" className="h-7 w-7 rounded object-cover" />
                ) : a.type.startsWith("image/") ? (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="max-w-[140px] truncate">{a.name}</span>
                <button
                  type="button"
                  onClick={() => setAttachments((p) => p.filter((x) => x.id !== a.id))}
                  className="rounded-full p-0.5 hover:bg-muted"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-2xl border border-border bg-card",
            "shadow-sm focus-within:ring-2 focus-within:ring-ring/40 transition",
            "px-2 py-2",
          )}
        >
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full shrink-0"
            onClick={() => fileRef.current?.click()}
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          />
          <textarea
            ref={textRef}
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              autoSize();
            }}
            onKeyDown={onKey}
            placeholder="Message Kaus…"
            className="flex-1 resize-none bg-transparent px-1 py-2 text-[15px] outline-none placeholder:text-muted-foreground max-h-60"
          />
          {isLoading ? (
            <Button
              type="button"
              size="icon"
              variant="default"
              onClick={onStop}
              className="h-9 w-9 rounded-full shrink-0"
              aria-label="Stop"
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={send}
              disabled={disabled || (!text.trim() && attachments.length === 0)}
              className="h-9 w-9 rounded-full shrink-0"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Kaus can make mistakes. Verify important info.
        </p>
      </div>
    </div>
  );
}
