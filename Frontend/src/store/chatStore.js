import { create } from "zustand";

const useChatStore =
  create((set) => ({
    messages: [],

    setMessages:
      (messages) =>
        set({
          messages,
        }),

    addMessage:
      (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            message,
          ],
        })),

    clearChat:
      () =>
        set({
          messages: [],
        }),
  }));

export default
  useChatStore;