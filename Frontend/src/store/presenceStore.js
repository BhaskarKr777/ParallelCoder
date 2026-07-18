import { create } from "zustand";

const usePresenceStore =
  create((set) => ({
    /*
      All collaborators
    */
    users: [],

    /*
      Current local user
    */
    currentUser:
      null,

    /*
      Active workspace room
    */
    workspaceId:
      null,

    /*
      Local identity
    */
    setCurrentUser:
      (user) =>
        set({
          currentUser:
            user,
        }),

    setWorkspaceId:
      (workspaceId) =>
        set({
          workspaceId,
        }),

    /*
      Replace full users list
      from socket event
    */
    setUsers:
      (users) =>
        set({
          users:
            users.map(
              (user) => ({
                ...user,
                editing:
                  user.editing ||
                  null,
              })
            ),
        }),

    /*
      Remove user
      on disconnect
    */
    removeUser:
      (
        socketId
      ) =>
        set((state) => ({
          users:
            state.users.filter(
              (
                user
              ) =>
                user.socketId !==
                socketId
            ),
        })),

    /*
      Live editing state
    */
    setUserEditing:
      (
        socketId,
        file
      ) =>
        set((state) => ({
          users:
            state.users.map(
              (
                user
              ) =>
                user.socketId ===
                socketId
                  ? {
                      ...user,
                      editing:
                        file,
                    }
                  : user
            ),
        })),
  }));

export default
  usePresenceStore;