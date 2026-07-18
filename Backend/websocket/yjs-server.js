import http from "http";
import jwt from "jsonwebtoken";
import { parse as parseCookie } from "cookie";
import { WebSocketServer } from "ws";

import {
  setupWSConnection,
} from "y-websocket/bin/utils";

import { env } from "../src/config/env.js";
import { getFileWorkspaceId } from "../src/services/file.service.js";
import { assertMembership } from "../src/services/workspace.service.js";

const server = http.createServer();

/*
  Reject the upgrade before the socket is accepted unless the
  connecting user holds a valid session and is a member of the
  workspace that owns the requested file (room name = fileId).
  Without this, anyone who knows/guesses a fileId can read and
  write that file's live content over the raw websocket, bypassing
  every REST-layer membership check.
*/
const verifyClient = async (info, callback) => {
  try {
    const fileId = info.req.url
      .split("?")[0]
      .replace(/^\//, "");

    if (!fileId) {
      return callback(false, 400, "Missing room");
    }

    const cookies = parseCookie(
      info.req.headers.cookie || ""
    );

    const token = cookies.accessToken;

    if (!token) {
      return callback(false, 401, "Unauthorized");
    }

    const payload = jwt.verify(
      token,
      env.jwtAccessSecret
    );

    const workspaceId = await getFileWorkspaceId(fileId);
    await assertMembership(payload.sub, workspaceId);

    return callback(true);
  } catch {
    return callback(false, 401, "Unauthorized");
  }
};

const wss = new WebSocketServer({
  server,
  verifyClient,
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
