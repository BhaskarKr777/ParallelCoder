import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

/* --------------------------------
   Middleware
-------------------------------- */
app.use(cors());

app.use(
  express.json()
);

/* --------------------------------
   HTTP Server
-------------------------------- */
const httpServer =
  createServer(app);

/* --------------------------------
   Socket.IO
-------------------------------- */
const io = new Server(
  httpServer,
  {
    cors: {
      origin: "*",
      methods: [
        "GET",
        "POST",
      ],
    },
  }
);

/* --------------------------------
   Presence State
-------------------------------- */
const activeUsers =
  new Map();

/* --------------------------------
   Socket Events
-------------------------------- */
io.on(
  "connection",
  (socket) => {
    console.log(
      `🟢 User Connected: ${socket.id}`
    );

    /*
      Join Workspace
    */
    socket.on(
      "join-workspace",
      ({
        workspaceId,
        user,
      }) => {
        socket.join(
          workspaceId
        );

        activeUsers.set(
          socket.id,
          {
            ...user,
            socketId:
              socket.id,
            workspaceId,
            editing:
              "Idle",
          }
        );

        /*
          Broadcast users
        */
        io.to(
          workspaceId
        ).emit(
          "workspace-users",
          Array.from(
            activeUsers.values()
          ).filter(
            (u) =>
              u.workspaceId ===
              workspaceId
          )
        );

        console.log(
          `👨‍💻 ${user.username} joined ${workspaceId}`
        );
      }
    );

    /*
      Editing File
    */
    socket.on(
      "editing-file",
      ({
        workspaceId,
        file,
      }) => {
        const user =
          activeUsers.get(
            socket.id
          );

        if (!user) return;

        user.editing =
          file;

        activeUsers.set(
          socket.id,
          user
        );

        io.to(
          workspaceId
        ).emit(
          "workspace-users",
          Array.from(
            activeUsers.values()
          ).filter(
            (u) =>
              u.workspaceId ===
              workspaceId
          )
        );
      }
    );

    /*
      Disconnect
    */
    socket.on(
      "disconnect",
      () => {
        const user =
          activeUsers.get(
            socket.id
          );

        if (user) {
          activeUsers.delete(
            socket.id
          );

          io.to(
            user.workspaceId
          ).emit(
            "workspace-users",
            Array.from(
              activeUsers.values()
            ).filter(
              (u) =>
                u.workspaceId ===
                user.workspaceId
            )
          );

          console.log(
            `🔴 User Disconnected: ${socket.id}`
          );
        }
      }
    );
  }
);

/* --------------------------------
   Health Check
-------------------------------- */
app.get(
  "/health",
  (_, res) => {
    res.status(200).json({
      success: true,
      message:
        "Parallel Coder Backend Healthy 🚀",
    });
  }
);

/* --------------------------------
   Start Server
-------------------------------- */
const PORT =
  process.env.PORT ||
  3000;

httpServer.listen(
  PORT,
  () => {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Parallel Coder Backend
🌐 Server:
http://localhost:${PORT}

❤️ Health:
/health

⚡ Socket.IO:
Active

👥 Presence:
Ready
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  }
);