import { useEffect } from "react";
import socket from "../services/socket";
import useChatStore from "../store/chatStore";

export const useChat =
  () => {
    const addMessage =
      useChatStore(
        (state) =>
          state.addMessage
      );

    const setMessages =
      useChatStore(
        (state) =>
          state.setMessages
      );

    useEffect(() => {
      const handleMessage =
        (message) => {
          addMessage(
            message
          );
        };

      const handleHistory =
        (history) => {
          if (Array.isArray(history)) {
            setMessages(history);
          }
        };

      socket.off("receive-message");
      socket.off("chat-history");

      socket.on("receive-message", handleMessage);
      socket.on("chat-history", handleHistory);

      return () => {
        socket.off("receive-message", handleMessage);
        socket.off("chat-history", handleHistory);
      };
    }, [
      addMessage,
      setMessages,
    ]);
  };