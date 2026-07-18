import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "http";
import { Server } from "socket.io";
import { io as ioClient } from "socket.io-client";
import request from "supertest";

import app from "../app.js";
import { registerCollaborationHandlers } from "../src/sockets/collaboration.socket.js";

const uniqueEmail = (label) =>
  `test_${label}_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

let httpServer;
let port;

const registerAndGetToken = async (label) => {
  const agent = request.agent(app);
  const email = uniqueEmail(label);

  const res = await agent
    .post("/api/auth/register")
    .send({ email, username: label, password: "TestPass123!" });

  const cookieHeader = res.headers["set-cookie"].find((c) => c.startsWith("accessToken="));
  const token = cookieHeader.split(";")[0].split("=")[1];

  return { agent, token };
};

const connectClient = (token) =>
  ioClient(`http://localhost:${port}`, {
    transportOptions: {
      polling: { extraHeaders: token ? { Cookie: `accessToken=${token}` } : {} },
    },
    forceNew: true,
  });

const waitFor = (socket, event, timeout = 2000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for ${event}`)), timeout);
    socket.once(event, (...args) => {
      clearTimeout(timer);
      resolve(args[0]);
    });
  });

beforeAll(async () => {
  httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*", credentials: true } });
  registerCollaborationHandlers(io);

  await new Promise((resolve) => httpServer.listen(0, resolve));
  port = httpServer.address().port;
});

afterAll(async () => {
  await new Promise((resolve) => httpServer.close(resolve));
});

describe("socket.io auth", () => {
  it("rejects a connection with no session cookie", async () => {
    const client = connectClient(null);
    const err = await waitFor(client, "connect_error");
    expect(err.message).toBe("Unauthorized");
    client.close();
  });

  it("accepts a connection with a valid session", async () => {
    const { token } = await registerAndGetToken("socketowner");
    const client = connectClient(token);

    await new Promise((resolve, reject) => {
      client.once("connect", resolve);
      client.once("connect_error", reject);
    });

    expect(client.connected).toBe(true);
    client.close();
  });

  it("only lets a workspace member join and receive presence for it", async () => {
    const { agent: ownerAgent, token: ownerToken } = await registerAndGetToken("wsowner");
    const { token: outsiderToken } = await registerAndGetToken("wsoutsider");

    const wsRes = await ownerAgent.post("/api/workspaces").send({ name: "Socket Test WS" });
    const workspaceId = wsRes.body.workspace.id;

    const ownerClient = connectClient(ownerToken);
    await waitFor(ownerClient, "connect");
    ownerClient.emit("join-workspace", { workspaceId, color: "#fff" });

    const users = await waitFor(ownerClient, "workspace-users");
    expect(users).toHaveLength(1);
    expect(users[0].username).toBe("wsowner");

    const outsiderClient = connectClient(outsiderToken);
    await waitFor(outsiderClient, "connect");

    let gotEvent = false;
    outsiderClient.once("workspace-users", () => {
      gotEvent = true;
    });
    outsiderClient.emit("join-workspace", { workspaceId, color: "#000" });

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(gotEvent).toBe(false);

    ownerClient.close();
    outsiderClient.close();
  });

  it("drops a chat message into a workspace the socket never joined", async () => {
    const { agent: ownerAgent, token: ownerToken } = await registerAndGetToken("chatowner");
    const { token: intruderToken } = await registerAndGetToken("chatintruder");

    const wsRes = await ownerAgent.post("/api/workspaces").send({ name: "Chat Test WS" });
    const workspaceId = wsRes.body.workspace.id;

    const ownerClient = connectClient(ownerToken);
    await waitFor(ownerClient, "connect");
    ownerClient.emit("join-workspace", { workspaceId, color: "#fff" });
    await waitFor(ownerClient, "workspace-users");

    let received = null;
    ownerClient.on("receive-message", (msg) => {
      received = msg;
    });

    const intruderClient = connectClient(intruderToken);
    await waitFor(intruderClient, "connect");
    // Deliberately never joins the workspace.
    intruderClient.emit("send-message", { workspaceId, message: "spoofed" });

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(received).toBeNull();

    ownerClient.close();
    intruderClient.close();
  });

  it("rejects run:start from a socket that isn't a workspace member", async () => {
    const { agent: ownerAgent } = await registerAndGetToken("runowner");
    const { token: outsiderToken } = await registerAndGetToken("runoutsider");

    const wsRes = await ownerAgent.post("/api/workspaces").send({ name: "Run Test WS" });
    const workspaceId = wsRes.body.workspace.id;

    const outsiderClient = connectClient(outsiderToken);
    await waitFor(outsiderClient, "connect");
    outsiderClient.emit("run:start", {
      workspaceId,
      fileId: "does-not-matter",
      language: "javascript",
      content: "console.log('should never run')",
    });

    const err = await waitFor(outsiderClient, "run:error");
    expect(err.message).toMatch(/not a member/i);

    outsiderClient.close();
  });
});
