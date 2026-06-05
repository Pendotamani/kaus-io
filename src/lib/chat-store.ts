import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
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

type State = {
  chats: Chat[];
  activeId: string | null;
  newChat: () => string;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, title: string) => void;
  addMessage: (chatId: string, msg: Message) => void;
  updateLastAssistant: (chatId: string, text: string) => void;
  removeLastAssistant: (chatId: string) => void;
  clearAll: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const useChatStore = create<State>()(
  persist(
    (set) => ({
      chats: [],
      activeId: null,
      newChat: () => {
        const id = uid();
        const chat: Chat = { id, title: "New chat", messages: [], createdAt: Date.now() };
        set((s) => ({ chats: [chat, ...s.chats], activeId: id }));
        return id;
      },
      selectChat: (id) => set({ activeId: id }),
      deleteChat: (id) =>
        set((s) => {
          const chats = s.chats.filter((c) => c.id !== id);
          return { chats, activeId: s.activeId === id ? (chats[0]?.id ?? null) : s.activeId };
        }),
      renameChat: (id, title) =>
        set((s) => ({ chats: s.chats.map((c) => (c.id === id ? { ...c, title } : c)) })),
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
      removeLastAssistant: (chatId) =>
        set((s) => ({
          chats: s.chats.map((c) => {
            if (c.id !== chatId) return c;
            const messages = [...c.messages];
            if (messages[messages.length - 1]?.role === "assistant") messages.pop();
            return { ...c, messages };
          }),
        })),
      clearAll: () => set({ chats: [], activeId: null }),
    }),
    {
      name: "kaus-chat-v2",
      partialize: (s) => ({ chats: s.chats, activeId: s.activeId }),
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
