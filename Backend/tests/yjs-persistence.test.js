import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rm } from "fs/promises";
import request from "supertest";
import WS from "ws";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

import app from "../app.js";
import { createYjsServer } from "../websocket/yjsApp.js";
import { docs as sharedDocs, getPersistence } from "y-websocket/bin/utils";

const uniqueEmail = (label) =>
  `test_${label}_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

const waitForSync = (provider) =>
  new Promise((resolve) => provider.once("sync", (isSynced) => isSynced && resolve()));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Yjs LevelDB persistence", () => {
  // CI does not load .env.test, while local tests do. This must match
  // persistence-env.js so cleanup always targets the directory actually used.
  const persistenceDir = process.env.YJS_PERSISTENCE_DIR || "./.yjs-data";
  let server;
  let wss;
  let port;
  let fileId;
  let cookieHeader;

  beforeAll(async () => {
    const agent = request.agent(app);
    const email = uniqueEmail("yjsowner");

    const registerRes = await agent
      .post("/api/auth/register")
      .send({ email, username: "yjsowner", password: "TestPass123!" })
      .expect(201);

    const token = registerRes.headers["set-cookie"]
      .find((c) => c.startsWith("accessToken="))
      .split(";")[0]
      .split("=")[1];
    cookieHeader = `accessToken=${token}`;

    const workspaceRes = await agent.post("/api/workspaces").send({ name: "Yjs Test WS" });
    const workspaceId = workspaceRes.body.workspace.id;

    const fileRes = await agent
      .post(`/api/workspaces/${workspaceId}/files`)
      .send({ name: "notes.js", path: "notes.js" });
    fileId = fileRes.body.file.id;

    ({ server, wss } = createYjsServer());
    await new Promise((resolve) => server.listen(0, resolve));
    port = server.address().port;
  });

  afterAll(async () => {
    await new Promise((resolve) => wss.close(resolve));
    await new Promise((resolve) => server.close(resolve));
    // LevelDB keeps its log files open for the life of the process;
    // release that handle before deleting the directory, or Windows
    // refuses to unlink files still held open (EBUSY).
    await getPersistence()?.provider?.destroy();
    await rm(persistenceDir, { recursive: true, force: true });
  });

  it("survives the server destroying the in-memory doc after everyone disconnects", async () => {
    class CookieWS extends WS {
      constructor(url, protocols) {
        super(url, protocols, { headers: { Cookie: cookieHeader } });
      }
    }

    const doc1 = new Y.Doc();
    const provider1 = new WebsocketProvider(`ws://localhost:${port}`, fileId, doc1, {
      WebSocketPolyfill: CookieWS,
    });

    await waitForSync(provider1);
    doc1.getText("monaco").insert(0, "hello from before a crash");

    // give the async LevelDB write (triggered by the doc's own
    // 'update' handler in y-websocket's persistence hook) a moment
    // to actually land on disk before disconnecting.
    await sleep(300);

    provider1.disconnect();
    provider1.destroy();

    // the server only destroys+forgets the in-memory doc once its
    // last connection closes - wait for that to actually happen so
    // the next connection can't just be reading stale server memory.
    for (let i = 0; i < 20 && sharedDocs.has(fileId); i++) {
      await sleep(100);
    }
    expect(sharedDocs.has(fileId)).toBe(false);

    const doc2 = new Y.Doc();
    const provider2 = new WebsocketProvider(`ws://localhost:${port}`, fileId, doc2, {
      WebSocketPolyfill: CookieWS,
    });

    await waitForSync(provider2);

    expect(doc2.getText("monaco").toString()).toBe("hello from before a crash");

    provider2.disconnect();
    provider2.destroy();
  }, 20000);
});
