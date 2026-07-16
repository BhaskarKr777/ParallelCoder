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
  const [message, setMessage] =
    useState("");

  const messages =
    useChatStore(
      (state) => state.messages
    );

  const currentUser =
    usePresenceStore(
      (state) => state.currentUser
    );

  const bottomRef =
    useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    console.log("SEND CLICKED");

    const trimmed =
      message.trim();

    if (
      !trimmed ||
      !currentUser
    ) {
      console.log(
        "blocked"
      );
      return;
    }

    socket.emit(
      "send-message",
      {
        workspaceId:
          "parallel-workspace",

        message:
          trimmed,

        user:
          currentUser.username,
      }
    );

    setMessage("");
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-3">
        <h3 className="text-white text-sm font-medium">
          Team Chat
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 custom-scroll">
        {messages.map((msg) => (
          <div key={msg.id}>
            <p className="text-[11px] text-neutral-500 mb-1">
              {msg.user}
            </p>

            <div
              className="
                rounded-2xl
                bg-[#101010]
                border
                border-neutral-900
                px-4
                py-3
                text-sm
                text-neutral-300
              "
            >
              {msg.message}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      <div className="relative mt-4">
        <input
          value={message}
          onChange={(e) =>
            setMessage(
              e.target.value
            )
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter"
            ) {
              sendMessage();
            }
          }}
          placeholder="Send a message..."
          className="
            w-full
            rounded-2xl
            bg-[#101010]
            border
            border-neutral-900
            px-4
            py-3
            text-sm
            text-white
            outline-none
            placeholder:text-neutral-500
          "
        />

        <button
          onClick={sendMessage}
          className="
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-neutral-500
            hover:text-white
            transition-colors
          "
        >
          <SendHorizontal
            size={18}
          />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;