import { create } from "zustand";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const usePresenceStore =
  create((set) => ({
    users: [],

    setUsers: (
      users
    ) =>
      set({
        users,
      }),

    addUser: (
      user
    ) =>
      set((state) => {
        const exists =
          state.users.find(
            (u) =>
              u.socketId ===
              user.socketId
          );

        if (exists) {
          return {
            users:
              state.users.map(
                (u) =>
                  u.socketId ===
                  user.socketId
                    ? {
                        ...u,
                        ...user,
                      }
                    : u
              ),
          };
        }

        return {
          users: [
            ...state.users,
            {
              ...user,
              color:
                COLORS[
                  Math.floor(
                    Math.random() *
                      COLORS.length
                  )
                ],
            },
          ],
        };
      }),

    updateEditingFile: (
      socketId,
      file
    ) =>
      set((state) => ({
        users:
          state.users.map(
            (u) =>
              u.socketId ===
              socketId
                ? {
                    ...u,
                    editing:
                      file,
                  }
                : u
          ),
      })),

    removeUser: (
      socketId
    ) =>
      set((state) => ({
        users:
          state.users.filter(
            (u) =>
              u.socketId !==
              socketId
          ),
      })),
  }));

export default usePresenceStore;