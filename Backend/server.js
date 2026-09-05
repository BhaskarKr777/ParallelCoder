import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { env } from "./src/config/env.js";
import { logger } from "./src/config/logger.js";
import prisma from "./src/config/prisma.js";
import { registerCollaborationHandlers } from "./src/sockets/collaboration.socket.js";

import { createYjsServer } from "./websocket/yjsApp.js";

/* --------------------------------
   HTTP Server
-------------------------------- */
const httpServer = createServer(app);

/* --------------------------------
   Socket.IO
-------------------------------- */
const io = new Server(httpServer, {
  cors: {
    origin: env.frontendUrl,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

registerCollaborationHandlers(io);

/* --------------------------------
   Single-Port Yjs Attachment
-------------------------------- */
const attachYjs = process.env.ATTACH_YJS === "true" || process.env.SINGLE_PORT === "true";

if (attachYjs) {
  const { wss: yjsWss } = createYjsServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/socket.io")) return;

    yjsWss.handleUpgrade(req, socket, head, (conn) => {
      yjsWss.emit("connection", conn, req);
    });
  });

  logger.info("Yjs WebSocket handler attached to main HTTP server");
}

/* --------------------------------
   Start Server
-------------------------------- */
httpServer.listen(env.port, () => {
  logger.info({ port: env.port }, "Parallel Coder backend listening");
});

/*
  Without this, a redeploy/container restart (SIGTERM from the
  orchestrator) kills in-flight HTTP requests and sockets outright
  instead of draining them. This stops accepting new connections,
  lets Socket.IO tell clients to disconnect cleanly, waits for
  in-flight HTTP requests to finish, then closes the DB pool - with a
  hard timeout so a stuck connection can't hang a deploy forever.
*/
let shuttingDown = false;

const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "Shutting down gracefully");

  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  io.close(() => {
    httpServer.close(async () => {
      await prisma.$disconnect();
      clearTimeout(forceExit);
      logger.info("Shutdown complete");
      process.exit(0);
    });
  });
};

process.on("uncaughtException", (err) => {
  logger.error({ err }, "Uncaught Exception");
});

process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled Rejection");
});

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
