import http from "http";
import { WebSocketServer } from "ws";

import {
  setupWSConnection,
} from "y-websocket/bin/utils";

const server = http.createServer();

const wss = new WebSocketServer({
  server,
});

wss.on(
  "connection",
  (conn, req) => {
    setupWSConnection(conn, req);
  }
);

server.listen(1234, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 Yjs Websocket Running
🌐 ws://localhost:1234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});