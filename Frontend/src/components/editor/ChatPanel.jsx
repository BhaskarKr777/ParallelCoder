import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import { SendHorizontal } from "lucide-react";

import socket from "../../services/socket";

import useChatStore from "../../store/chatStore";
import usePresenceStore from "../../store/presenceStore";

const ChatPanel = () => {
  const [message, setMessage] = useState("");
  const messages = useChatStore((state) => state.messages);
  const workspaceId = usePresenceStore((state) => state.workspaceId);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    const trimmed = message.trim();

    if (!trimmed || !workspaceId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("send-message", {
      workspaceId,
      message: trimmed,
    });

    setMessage("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-white text-sm font-medium">
          Team Chat
        </h3>
        <span className="text-xs text-neutral-500">Realtime</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-neutral-500 text-xs">
            No messages yet. Say hello to your team!
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={msg.id || index}>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                <span className="font-semibold text-zinc-300">{msg.user || "User"}</span>
                <span className="text-[10px] text-zinc-500">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>

              <div className="rounded-2xl bg-[#121212] border border-neutral-800 px-4 py-2.5 text-sm text-neutral-200 break-words leading-relaxed">
                {msg.message}
              </div>
            </div>
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <div className="relative mt-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Send a message..."
          className="w-full rounded-2xl bg-[#101010] border border-neutral-900 px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-neutral-700 transition"
        />

        <button
          onClick={sendMessage}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;