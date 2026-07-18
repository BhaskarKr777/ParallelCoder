import jwt from "jsonwebtoken";
import { parse as parseCookie } from "cookie";

import { env } from "../config/env.js";
import { getUserById } from "../services/auth.service.js";
import { assertMembership } from "../services/workspace.service.js";

/* --------------------------------
   Presence State
-------------------------------- */
const activeUsers = new Map();

/*
  Reject the handshake unless the connecting socket carries a valid
  session. Everything downstream (join-workspace, send-message,
  editing-file) trusts socket.data.user instead of client-supplied
  identity, so a client can no longer spoof another user's name or
  broadcast into a workspace it isn't a member of.
*/
const authenticateSocket = async (socket, next) => {
  try {
    const cookies = parseCookie(
      socket.handshake.headers.cookie || ""
    );

    const token = cookies.accessToken;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const payload = jwt.verify(
      token,
      env.jwtAccessSecret
    );

    const user = await getUserById(payload.sub);

    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.data.user = user;
    socket.data.workspaces = new Set();

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};

export const registerCollaborationHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const currentUser = () => socket.data.user;

    socket.on("send-message", ({ workspaceId, message }) => {
      if (!socket.data.workspaces.has(workspaceId)) return;

      io.to(workspaceId).emit("receive-message", {
        id: `${socket.id}-${Date.now()}`,
        user: currentUser().username,
        message,
        createdAt: new Date().toISOString(),
      });
    });

    console.log(`🟢 User Connected: ${socket.id}`);

    /*
      Join Workspace
    */
    socket.on("join-workspace", async ({ workspaceId, color }) => {
      try {
        await assertMembership(currentUser().id, workspaceId);
      } catch {
        return;
      }

      socket.join(workspaceId);
      socket.data.workspaces.add(workspaceId);

      activeUsers.set(socket.id, {
        ...currentUser(),
        socketId: socket.id,
        color,
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

      console.log(`👨‍💻 ${currentUser().username} joined ${workspaceId}`);
    });

    /*
      Editing File
    */
    socket.on("editing-file", ({ file }) => {
      const user = activeUsers.get(socket.id);

      if (!user) return;

      user.editing = file;

      activeUsers.set(socket.id, user);

      io.to(user.workspaceId).emit(
        "workspace-users",
        Array.from(activeUsers.values()).filter(
          (u) => u.workspaceId === user.workspaceId
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
