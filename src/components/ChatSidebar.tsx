import { Plus, MessageSquare, Trash2, X, Moon, Sun, ShieldCheck, Info, Settings as SettingsIcon } from "lucide-react";
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
  const { chats, activeId, selectChat, deleteChat, newChat, theme, setTheme, isGuest } =
    useChatStore();

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

        <div className="p-3">
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
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-2">
          <div className="px-2 py-1 text-[11px] uppercase tracking-wider text-muted-foreground">
            Recent
          </div>
          {chats.length === 0 && (
            <div className="px-3 py-6 text-sm text-muted-foreground">No chats yet.</div>
          )}
          <ul className="space-y-0.5">
            {chats.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    selectChat(c.id);
                    onClose();
                  }}
                  className={cn(
                    "group w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-left",
                    "hover:bg-accent hover:text-accent-foreground transition",
                    activeId === c.id && "bg-accent text-accent-foreground",
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 opacity-70" />
                  <span className="flex-1 truncate">{c.title}</span>
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
                </button>
              </li>
            ))}
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
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        </div>
      </aside>
    </>
  );
}
