/* --------------------------------
   Presence State
-------------------------------- */
const activeUsers = new Map();

export const registerCollaborationHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("send-message", ({ workspaceId, message, user }) => {
      console.log("MESSAGE RECEIVED:", { workspaceId, message, user });

      io.to(workspaceId).emit("receive-message", {
        id: `${socket.id}-${Date.now()}`,
        user,
        message,
        createdAt: new Date().toISOString(),
      });
    });

    console.log(`🟢 User Connected: ${socket.id}`);

    /*
      Join Workspace
    */
    socket.on("join-workspace", ({ workspaceId, user }) => {
      socket.join(workspaceId);

      activeUsers.set(socket.id, {
        ...user,
        socketId: socket.id,
        workspaceId,
        editing: null,
      });

      /*
        Broadcast users
      */
      io.to(workspaceId).emit(
        "workspace-users",
        Array.from(activeUsers.values()).filter(
          (u) => u.workspaceId === workspaceId
        )
      );

      console.log(`👨‍💻 ${user.username} joined ${workspaceId}`);
    });

    /*
      Editing File
    */
    socket.on("editing-file", ({ workspaceId, file }) => {
      const user = activeUsers.get(socket.id);

      if (!user) return;

      user.editing = file;

      activeUsers.set(socket.id, user);

      io.to(workspaceId).emit(
        "workspace-users",
        Array.from(activeUsers.values()).filter(
          (u) => u.workspaceId === workspaceId
        )
      );
    });

    /*
      Disconnect
    */
    socket.on("disconnect", () => {
      const user = activeUsers.get(socket.id);

      if (user) {
        activeUsers.delete(socket.id);

        io.to(user.workspaceId).emit(
          "workspace-users",
          Array.from(activeUsers.values()).filter(
            (u) => u.workspaceId === user.workspaceId
          )
        );

        console.log(`🔴 User Disconnected: ${socket.id}`);
      }
    });
  });
};
