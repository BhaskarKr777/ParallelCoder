import React from "react";
import { SendHorizontal } from "lucide-react";

const messages = [
  {
    id: 1,
    user: "Bhaskar",
    text: "Let's improve the editor UI.",
  },
  {
    id: 2,
    user: "Rohit",
    text: "I am working on collaboration.",
  },
];

const ChatPanel = () => {
  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            <p className="text-xs text-zinc-500 mb-1">
              {msg.user}
            </p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300">
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-4 border border-zinc-800 rounded-xl bg-zinc-900 p-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Send a message..."
          className="bg-transparent outline-none text-sm text-white flex-1 placeholder:text-zinc-500"
        />

        <button className="text-zinc-400 hover:text-white transition">
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;