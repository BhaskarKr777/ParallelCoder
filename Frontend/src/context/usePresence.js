import { useEffect } from "react";
import socket from "../services/socket";
import usePresenceStore from "../store/presenceStore";

export const usePresence =
  () => {
    const {
      addUser,
      removeUser,
    } =
      usePresenceStore();

    useEffect(() => {
      /*
        Unique user per browser tab
      */
      const user = {
        id: socket.id,

        username:
          "Guest-" +
          Math.floor(
            Math.random() *
              1000
          ),

        avatar: "👨‍💻",
      };

      /*
        Join workspace
      */
      socket.emit(
        "join-workspace",
        {
          workspaceId:
            "parallel-workspace",

          user,
        }
      );

      /*
        Receive users
      */
      const handleUsers =
        (users) => {
          const unique =
            Array.from(
              new Map(
                users.map(
                  (u) => [
                    u.socketId,
                    u,
                  ]
                )
              ).values()
            );

          unique.forEach(
            addUser
          );
        };

      socket.on(
        "workspace-users",
        handleUsers
      );

      return () => {
        socket.off(
          "workspace-users",
          handleUsers
        );

        removeUser(
          socket.id
        );
      };
    }, []);
  };