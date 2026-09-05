import { useEffect } from "react";
import socket from "../services/socket";
import usePresenceStore from "../store/presenceStore";
import useAuthStore from "../store/authStore";

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
        Real identity comes from the authenticated
        session; only the color is client-chosen.
      */
      const authUser =
        useAuthStore.getState()
          .user;

      const color =
        colors[
          Math.floor(
            Math.random() *
              colors.length
          )
        ];

      const user = {
        socketId:
          socket.id,

        username:
          authUser?.username ||
          "Guest",

        avatar:
          authUser?.avatar ||
          "👨‍💻",

        color,
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
        (server derives identity from the session;
        only the cosmetic color is sent)
      */
      socket.emit(
        "join-workspace",
        {
          workspaceId,

          color,
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
    }, [
      workspaceId,
      removeUser,
      setCurrentUser,
      setUserEditing,
      setUsers,
      setWorkspaceId,
    ]);

    return null;
  };