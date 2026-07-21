import { createYjsServer } from "./yjsApp.js";
import { logger } from "../src/config/logger.js";
import prisma from "../src/config/prisma.js";

const { server, wss } = createYjsServer();

server.listen(1234, () => {
  logger.info({ port: 1234 }, "Yjs websocket server listening");
});

/*
  Without this, a redeploy/container restart (SIGTERM from the
  orchestrator) drops in-flight sync connections outright instead of
  draining them.
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

  wss.close(() => {
    server.close(async () => {
      await prisma.$disconnect();
      clearTimeout(forceExit);
      logger.info("Shutdown complete");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
