import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Attachment = {
  id: string;
  name: string;
  type: string; // mime
  size: number;
  dataUrl?: string; // for images preview
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  createdAt: number;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
};

type Theme = "light" | "dark";

type State = {
  chats: Chat[];
  activeId: string | null;
  theme: Theme;
  isGuest: boolean;
  setGuest: (v: boolean) => void;
  newChat: () => string;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  addMessage: (chatId: string, msg: Message) => void;
  updateLastAssistant: (chatId: string, text: string) => void;
  setTheme: (t: Theme) => void;
  clearAll: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

// Clear guest session on fresh app open (new tab / app restart).
// Uses sessionStorage as a "this tab is alive" flag — when missing, we treat
// it as a cold start and wipe any persisted guest chats before zustand
// rehydrates. Theme preference is preserved.
if (typeof window !== "undefined") {
  try {
    const SESSION_FLAG = "kaus-session-active";
    const PERSIST_KEY = "kaus-chat-v1";
    if (!sessionStorage.getItem(SESSION_FLAG)) {
      const raw = localStorage.getItem(PERSIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.isGuest) {
          parsed.state.chats = [];
          parsed.state.activeId = null;
          parsed.state.isGuest = false;
          localStorage.setItem(PERSIST_KEY, JSON.stringify(parsed));
        }
      }
      sessionStorage.setItem(SESSION_FLAG, "1");
    }
  } catch {
    // ignore storage access errors (private mode, etc.)
  }
}

export const useChatStore = create<State>()(
  persist(
    (set, get) => ({
      chats: [],
      activeId: null,
      theme: "dark",
      isGuest: false,
      setGuest: (v) => set({ isGuest: v }),
      newChat: () => {
        const id = uid();
        const chat: Chat = {
          id,
          title: "New chat",
          messages: [],
          createdAt: Date.now(),
        };
        set((s) => ({ chats: [chat, ...s.chats], activeId: id }));
        return id;
      },
      selectChat: (id) => set({ activeId: id }),
      deleteChat: (id) =>
        set((s) => {
          const chats = s.chats.filter((c) => c.id !== id);
          return {
            chats,
            activeId: s.activeId === id ? (chats[0]?.id ?? null) : s.activeId,
          };
        }),
      renameChat: (id, title) =>
        set((s) => ({
          chats: s.chats.map((c) => (c.id === id ? { ...c, title } : c)),
        })),
      addMessage: (chatId, msg) =>
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== chatId) return c;
            const messages = [...c.messages, msg];
            const title =
              c.messages.length === 0 && msg.role === "user"
                ? msg.content.slice(0, 48) || "New chat"
                : c.title;
            return { ...c, messages, title };
          }),
        })),
      updateLastAssistant: (chatId, text) =>
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== chatId) return c;
            const messages = [...c.messages];
            const last = messages[messages.length - 1];
            if (last && last.role === "assistant") {
              messages[messages.length - 1] = { ...last, content: text };
            }
            return { ...c, messages };
          }),
        })),
      setTheme: (t) => {
        set({ theme: t });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", t === "dark");
        }
      },
      clearAll: () => set({ chats: [], activeId: null }),
    }),
    {
      name: "kaus-chat-v1",
      partialize: (s) => ({
        chats: s.chats,
        activeId: s.activeId,
        theme: s.theme,
        isGuest: s.isGuest,
      }),
    },
  ),
);

export function makeMessage(
  role: Message["role"],
  content: string,
  attachments?: Attachment[],
): Message {
  return { id: uid(), role, content, createdAt: Date.now(), attachments };
}
