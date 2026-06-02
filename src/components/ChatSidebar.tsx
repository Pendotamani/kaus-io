import { useMemo, useState } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  ShieldCheck,
  Info,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KausLogo } from "./KausLogo";
import { useChatStore } from "@/lib/chat-store";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  open,
  onClose,
  onOpenAbout,
  onOpenSettings,
}: {
  open: boolean;
  onClose: () => void;
  onOpenAbout?: () => void;
  onOpenSettings?: () => void;
}) {
  const { chats, activeId, selectChat, deleteChat, newChat, renameChat, isGuest, logout } =
    useChatStore();

  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [chats, query]);

  const commitRename = (id: string) => {
    const title = draftTitle.trim();
    if (title) renameChat(id, title.slice(0, 80));
    setEditingId(null);
    setDraftTitle("");
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed z-40 inset-y-0 left-0 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
          "flex flex-col transition-transform duration-200 ease-out",
          "md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <KausLogo size={32} />
            <div className="min-w-0">
              <div className="font-semibold tracking-tight font-[var(--font-display)]">Kaus</div>
              <div className="text-[11px] text-muted-foreground -mt-0.5">AI Assistant</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden h-8 w-8"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isGuest && (
          <div className="px-3 pt-3">
            <Badge variant="secondary" className="gap-1 w-full justify-center py-1">
              <ShieldCheck className="h-3 w-3" /> Guest Mode
            </Badge>
          </div>
        )}

        <div className="p-3 space-y-2">
          <Button
            onClick={() => {
              newChat();
              onClose();
            }}
            className="w-full justify-start gap-2"
            variant="secondary"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-md border border-border bg-card pl-8 pr-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-2">
          <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Recent
          </div>
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-sm text-muted-foreground">
              {chats.length === 0 ? "No chats yet." : "No matches."}
            </div>
          )}
          <ul className="space-y-0.5">
            {filtered.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <li key={c.id}>
                  <div
                    className={cn(
                      "group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm",
                      "hover:bg-accent hover:text-accent-foreground transition",
                      activeId === c.id && "bg-accent text-accent-foreground",
                    )}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={draftTitle}
                        onChange={(e) => setDraftTitle(e.target.value)}
                        onBlur={() => commitRename(c.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename(c.id);
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setDraftTitle("");
                          }
                        }}
                        className="flex-1 bg-transparent outline-none border-b border-border text-sm"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          selectChat(c.id);
                          onClose();
                        }}
                        className="flex-1 truncate text-left"
                      >
                        {c.title}
                      </button>
                    )}
                    {isEditing ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          commitRename(c.id);
                        }}
                        className="p-1 rounded hover:bg-muted"
                        aria-label="Save"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(c.id);
                            setDraftTitle(c.title);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted"
                          aria-label="Rename chat"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(c.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          {onOpenAbout && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={onOpenAbout}
            >
              <Info className="h-4 w-4" />
              About Kaus
            </Button>
          )}
          {onOpenSettings && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={onOpenSettings}
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Button>
          )}
          {isGuest && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={() => {
                onClose();
                logout();
              }}
            >
              <LogOut className="h-4 w-4" />
              Exit Guest Mode
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
