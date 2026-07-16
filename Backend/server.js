import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { env } from "./src/config/env.js";
import { registerCollaborationHandlers } from "./src/sockets/collaboration.socket.js";

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
   Start Server
-------------------------------- */
httpServer.listen(env.port, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Parallel Coder Backend
🌐 Server:
http://localhost:${env.port}

❤️ Health:
/health

⚡ Socket.IO:
Active

👥 Presence:
Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});
