import jwt from "jsonwebtoken";
import { parse as parseCookie } from "cookie";
import { z } from "zod";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import prisma from "../config/prisma.js";
import { getUserById } from "../services/auth.service.js";
import { assertMembership } from "../services/workspace.service.js";
import { runCode, isRunnableLanguage } from "../services/runner.service.js";

/* --------------------------------
   Presence & Rate Limiting State
-------------------------------- */
const activeUsers = new Map();

/*
  Global cap on simultaneously running sandboxed containers,
  independent of per-socket limits - protects the host regardless of
  how many different users/workspaces are running code at once.
*/
const MAX_CONCURRENT_RUNS = 4;
let activeRunCount = 0;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_CODE_LENGTH = 256 * 1024; // 256 KB

const messageSchema = z.object({
  workspaceId: z.string().min(1).max(100),
  message: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

const runSchema = z.object({
  workspaceId: z.string().min(1).max(100),
  fileId: z.string().min(1).max(100),
  language: z.string().min(1).max(50),
  content: z.string().max(MAX_CODE_LENGTH),
});

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

    if (!user || payload.tokenVersion !== user.tokenVersion) {
      return next(new Error("Unauthorized"));
    }

    socket.data.user = user;
    socket.data.workspaces = new Set();
    socket.data.roles = new Map();
    socket.data.lastMessageTime = 0;
    socket.data.messageCount = 0;

    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};

export const registerCollaborationHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const currentUser = () => socket.data.user;

    socket.on("send-message", async (data) => {
      try {
        const parsed = messageSchema.safeParse(data);
        if (!parsed.success) return;

        const { workspaceId, message } = parsed.data;
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        if (!socket.data.workspaces.has(workspaceId)) {
          try {
            await assertMembership(currentUser().id, workspaceId);
            socket.join(workspaceId);
            socket.data.workspaces.add(workspaceId);
          } catch {
            return;
          }
        }

        // Per-socket simple rate limit (max 60 messages/minute)
        const now = Date.now();
        if (now - socket.data.lastMessageTime > 60000) {
          socket.data.lastMessageTime = now;
          socket.data.messageCount = 1;
        } else {
          socket.data.messageCount += 1;
          if (socket.data.messageCount > 60) return;
        }

        // Persist message to database
        const saved = await prisma.chatMessage.create({
          data: {
            workspaceId,
            senderId: currentUser().id,
            message: trimmedMessage,
          },
        });

        io.to(workspaceId).emit("receive-message", {
          id: saved.id,
          user: currentUser().username,
          message: saved.message,
          createdAt: saved.createdAt.toISOString(),
        });
      } catch (err) {
        logger.error({ err }, "Failed to process send-message");
      }
    });

    logger.info({ socketId: socket.id }, "User connected");

    /*
      Join Workspace
    */
    socket.on("join-workspace", async ({ workspaceId, color }) => {
      if (!workspaceId || typeof workspaceId !== "string") return;

      let member;

      try {
        member = await assertMembership(currentUser().id, workspaceId);
      } catch {
        return;
      }

      socket.join(workspaceId);
      socket.data.workspaces.add(workspaceId);
      socket.data.roles.set(workspaceId, member.role);

      activeUsers.set(socket.id, {
        ...currentUser(),
        socketId: socket.id,
        color: typeof color === "string" ? color.slice(0, 30) : "#3B82F6",
        workspaceId,
        editing: null,
      });

      /*
        Send persisted chat history to joining user
      */
      try {
        const history = await prisma.chatMessage.findMany({
          where: { workspaceId },
          orderBy: { createdAt: "asc" },
          take: 100,
          include: { sender: { select: { username: true } } },
        });

        socket.emit(
          "chat-history",
          history.map((m) => ({
            id: m.id,
            user: m.sender.username,
            message: m.message,
            createdAt: m.createdAt.toISOString(),
          }))
        );
      } catch (err) {
        logger.error({ err, workspaceId }, "Failed to fetch chat history");
      }

      /*
        Broadcast users
      */
      io.to(workspaceId).emit(
        "workspace-users",
        Array.from(activeUsers.values()).filter(
          (u) => u.workspaceId === workspaceId
        )
      );

      logger.info({ username: currentUser().username, workspaceId }, "User joined workspace");
    });

    /*
      Editing File
    */
    socket.on("editing-file", ({ file }) => {
      const user = activeUsers.get(socket.id);

      if (!user) return;

      user.editing = typeof file === "string" ? file.slice(0, 200) : null;

      activeUsers.set(socket.id, user);

      io.to(user.workspaceId).emit(
        "workspace-users",
        Array.from(activeUsers.values()).filter(
          (u) => u.workspaceId === user.workspaceId
        )
      );
    });

    /*
      Run code (sandboxed - see runner.service.js)
    */
    socket.on("run:start", async (data) => {
      const parsed = runSchema.safeParse(data);
      if (!parsed.success) {
        socket.emit("run:error", { message: "Invalid payload or code size exceeds limit (256KB)" });
        return;
      }

      const { workspaceId, fileId, language, content } = parsed.data;

      if (!socket.data.workspaces.has(workspaceId)) {
        socket.emit("run:error", { message: "Not a member of this workspace" });
        return;
      }

      if (socket.data.running) {
        socket.emit("run:error", { message: "A run is already in progress for this session" });
        return;
      }

      if (!isRunnableLanguage(language)) {
        socket.emit("run:error", { message: `Running ${language || "this language"} isn't supported yet` });
        return;
      }

      if (socket.data.roles.get(workspaceId) === "VIEWER") {
        socket.emit("run:error", { message: "Viewers can't run code in this workspace" });
        return;
      }

      if (activeRunCount >= MAX_CONCURRENT_RUNS) {
        socket.emit("run:error", { message: "Server is busy running other code, try again shortly" });
        return;
      }

      const runId = `${socket.id}-${Date.now()}`;
      socket.data.running = true;
      activeRunCount += 1;

      io.to(workspaceId).emit("run:start", {
        runId,
        fileId,
        initiatedBy: currentUser().username,
      });

      try {
        const result = await runCode({
          language,
          content,
          onStdout: (chunk) => io.to(workspaceId).emit("run:stdout", { runId, chunk }),
          onStderr: (chunk) => io.to(workspaceId).emit("run:stderr", { runId, chunk }),
        });

        io.to(workspaceId).emit("run:exit", { runId, ...result });
      } catch (err) {
        logger.error({ err, runId, workspaceId, language }, "Sandboxed run failed to start");

        io.to(workspaceId).emit("run:exit", {
          runId,
          exitCode: null,
          timedOut: false,
          truncated: false,
          error: err.message,
        });
      } finally {
        socket.data.running = false;
        activeRunCount -= 1;
      }
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

        logger.info({ socketId: socket.id }, "User disconnected");
      }
    });
  });
};

