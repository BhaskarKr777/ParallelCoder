import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

import app from "../app.js";

const uniqueEmail = (label) =>
  `test_${label}_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

const registerAgent = async (label) => {
  const agent = request.agent(app);

  await agent
    .post("/api/auth/register")
    .send({ email: uniqueEmail(label), username: label, password: "TestPass123!" })
    .expect(201);

  return agent;
};

describe("workspace + file authorization", () => {
  let owner;
  let outsider;
  let workspaceId;

  beforeAll(async () => {
    owner = await registerAgent("owner");
    outsider = await registerAgent("outsider");

    const res = await owner.post("/api/workspaces").send({ name: "Test Workspace" });
    expect(res.status).toBe(201);
    workspaceId = res.body.workspace.id;
  });

  it("lets the owner create and list files in their workspace", async () => {
    const create = await owner
      .post(`/api/workspaces/${workspaceId}/files`)
      .send({ name: "index.js", path: "index.js", language: "javascript" });

    expect(create.status).toBe(201);
    expect(create.body.file.name).toBe("index.js");

    const list = await owner.get(`/api/workspaces/${workspaceId}/files`);
    expect(list.status).toBe(200);
    expect(list.body.files.some((f) => f.id === create.body.file.id)).toBe(true);
  });

  it("blocks a non-member from listing or creating files in the workspace", async () => {
    const list = await outsider.get(`/api/workspaces/${workspaceId}/files`);
    expect(list.status).toBe(403);

    const create = await outsider
      .post(`/api/workspaces/${workspaceId}/files`)
      .send({ name: "evil.js", path: "evil.js" });
    expect(create.status).toBe(403);
  });

  it("blocks a non-member from updating or deleting a file by id", async () => {
    const created = await owner
      .post(`/api/workspaces/${workspaceId}/files`)
      .send({ name: "secret.js", path: "secret.js" });
    const fileId = created.body.file.id;

    const update = await outsider
      .patch(`/api/files/${fileId}`)
      .send({ content: "hacked" });
    expect(update.status).toBe(403);

    const remove = await outsider.delete(`/api/files/${fileId}`);
    expect(remove.status).toBe(403);

    // the file must be untouched
    const stillThere = await owner.get(`/api/workspaces/${workspaceId}/files`);
    const file = stillThere.body.files.find((f) => f.id === fileId);
    expect(file).toBeDefined();
    expect(file.content).not.toBe("hacked");
  });

  it("lets the owner update their own file", async () => {
    const created = await owner
      .post(`/api/workspaces/${workspaceId}/files`)
      .send({ name: "ok.js", path: "ok.js" });
    const fileId = created.body.file.id;

    const update = await owner
      .patch(`/api/files/${fileId}`)
      .send({ content: "console.log('ok')" });

    expect(update.status).toBe(200);
    expect(update.body.file.content).toBe("console.log('ok')");
  });

  it("404s file operations on a nonexistent file instead of leaking membership info", async () => {
    const res = await owner.patch("/api/files/does-not-exist").send({ content: "x" });
    expect(res.status).toBe(404);
  });

  it("rejects unauthenticated requests entirely", async () => {
    const res = await request(app).get(`/api/workspaces/${workspaceId}/files`);
    expect(res.status).toBe(401);
  });
});
