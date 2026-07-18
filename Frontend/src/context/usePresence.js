import { useEffect } from "react";
import socket from "../services/socket";
import usePresenceStore from "../store/presenceStore";

export const usePresence =
  (workspaceId) => {
    const {
      removeUser,
      setUserEditing,
      setCurrentUser,
      setWorkspaceId,
      setUsers,
    } =
      usePresenceStore();

    useEffect(() => {
      if (!workspaceId)
        return;

      /*
        Shared colors
      */
      const colors = [
        "#3B82F6",
        "#10B981",
        "#F59E0B",
        "#EF4444",
        "#A855F7",
        "#EC4899",
      ];

      /*
        Unique user per tab
      */
      const user = {
        socketId:
          socket.id,

        username:
          "Guest-" +
          Math.floor(
            Math.random() *
              1000
          ),

        avatar: "👨‍💻",

        color:
          colors[
            Math.floor(
              Math.random() *
                colors.length
            )
          ],
      };

      /*
        Save globally
      */
      setCurrentUser(
        user
      );

      setWorkspaceId(
        workspaceId
      );

      /*
        Join workspace
      */
      socket.emit(
        "join-workspace",
        {
          workspaceId,

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

          /*
            Replace full list
          */
          setUsers(
            unique
          );
        };

      /*
        Live editing
      */
      const handleEditing =
        ({
          socketId,
          file,
        }) => {
          setUserEditing(
            socketId,
            file
          );
        };

      socket.on(
        "workspace-users",
        handleUsers
      );

      socket.on(
        "user-editing",
        handleEditing
      );

      return () => {
        socket.off(
          "workspace-users",
          handleUsers
        );

        socket.off(
          "user-editing",
          handleEditing
        );

        removeUser(
          socket.id
        );
      };
    }, [workspaceId]);

    return null;
  };