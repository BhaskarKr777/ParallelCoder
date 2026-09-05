import "./persistence-env.js";

import http from "http";
import jwt from "jsonwebtoken";
import { parse as parseCookie } from "cookie";
import { WebSocketServer } from "ws";

import {
  setupWSConnection,
} from "y-websocket/bin/utils";

import { env } from "../src/config/env.js";
import { getUserById } from "../src/services/auth.service.js";
import { getFileWorkspaceId } from "../src/services/file.service.js";
import { assertMembership } from "../src/services/workspace.service.js";

/*
  Builds the Yjs collaboration websocket server without starting it -
  split out from yjs-server.js (which does the actual `listen()` +
  process signal handling) so tests can spin this up on an ephemeral
  port instead of importing a script that binds a fixed port and
  installs global SIGTERM/SIGINT handlers as a side effect of import.
*/
export const createYjsServer = (options = {}) => {
  const server = options.noServer ? null : options.server || http.createServer();

  /*
    Reject the upgrade before the socket is accepted unless the
    connecting user holds a valid, non-revoked session and is a
    member of the workspace that owns the requested file (room name
    = fileId). Without this, anyone who knows/guesses a fileId can
    read and write that file's live content over the raw websocket,
    bypassing every REST-layer membership check.
  */
  const verifyClient = async (info, callback) => {
    try {
      // 1. Origin verification to prevent CSWSH attacks
      const reqOrigin = info.origin || info.req.headers.origin;
      if (reqOrigin && env.frontendUrl) {
        try {
          const expectedOrigin = new URL(env.frontendUrl).origin;
          const actualOrigin = new URL(reqOrigin).origin;
          if (expectedOrigin !== actualOrigin) {
            return callback(false, 403, "Forbidden Origin");
          }
        } catch {
          // If URL parsing fails, reject
          return callback(false, 403, "Invalid Origin");
        }
      }

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

      const user = await getUserById(payload.sub);

      if (!user || payload.tokenVersion !== user.tokenVersion) {
        return callback(false, 401, "Unauthorized");
      }

      const workspaceId = await getFileWorkspaceId(fileId);
      await assertMembership(payload.sub, workspaceId);

      return callback(true);
    } catch {
      return callback(false, 401, "Unauthorized");
    }
  };

  const wssConfig = options.noServer
    ? { noServer: true, verifyClient, maxPayload: 512 * 1024 }
    : { server, verifyClient, maxPayload: 512 * 1024 };

  const wss = new WebSocketServer(wssConfig);

  wss.on(
    "connection",
    (conn, req) => {
      setupWSConnection(conn, req);
    }
  );

  return { server, wss };
};

