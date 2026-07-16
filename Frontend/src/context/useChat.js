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

    useEffect(() => {
      const handleMessage =
        (message) => {
          addMessage(
            message
          );
        };

      socket.off(
        "receive-message"
      );

      socket.on(
        "receive-message",
        handleMessage
      );

      return () => {
        socket.off(
          "receive-message",
          handleMessage
        );
      };
    }, [
      addMessage,
    ]);
  };