import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";

import app from "../app.js";

const uniqueEmail = (label) =>
  `test_${label}_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

const registerAgent = async (label) => {
  const agent = request.agent(app);
  const email = uniqueEmail(label);

  await agent
    .post("/api/auth/register")
    .send({ email, username: label, password: "TestPass123!" })
    .expect(201);

  return { agent, email };
};

describe("workspace member management", () => {
  let owner;
  let editor;
  let viewer;
  let outsider;
  let workspaceId;
  let editorMemberId;
  let viewerMemberId;

  beforeAll(async () => {
    owner = await registerAgent("owner");
    editor = await registerAgent("editor");
    viewer = await registerAgent("viewer");
    outsider = await registerAgent("outsider");

    const res = await owner.agent.post("/api/workspaces").send({ name: "Team Workspace" });
    expect(res.status).toBe(201);
    workspaceId = res.body.workspace.id;
  });

  it("blocks a non-member from listing or inviting members", async () => {
    const list = await outsider.agent.get(`/api/workspaces/${workspaceId}/members`);
    expect(list.status).toBe(403);

    const invite = await outsider.agent
      .post(`/api/workspaces/${workspaceId}/members`)
      .send({ email: editor.email, role: "EDITOR" });
    expect(invite.status).toBe(403);
  });

  it("lets the owner invite an existing user by email", async () => {
    const invite = await owner.agent
      .post(`/api/workspaces/${workspaceId}/members`)
      .send({ email: editor.email, role: "EDITOR" });

    expect(invite.status).toBe(201);
    expect(invite.body.member.role).toBe("EDITOR");
    editorMemberId = invite.body.member.id;

    const viewerInvite = await owner.agent
      .post(`/api/workspaces/${workspaceId}/members`)
      .send({ email: viewer.email, role: "VIEWER" });

    expect(viewerInvite.status).toBe(201);
    viewerMemberId = viewerInvite.body.member.id;
  });

  it("rejects inviting an email with no account", async () => {
    const invite = await owner.agent
      .post(`/api/workspaces/${workspaceId}/members`)
      .send({ email: "nobody@example.com", role: "EDITOR" });

    expect(invite.status).toBe(404);
  });

  it("rejects inviting someone who is already a member", async () => {
    const invite = await owner.agent
      .post(`/api/workspaces/${workspaceId}/members`)
      .send({ email: editor.email, role: "EDITOR" });

    expect(invite.status).toBe(409);
  });

  it("blocks a non-manager (EDITOR) from inviting or changing roles", async () => {
    const invite = await editor.agent
      .post(`/api/workspaces/${workspaceId}/members`)
      .send({ email: outsider.email, role: "EDITOR" });
    expect(invite.status).toBe(403);

    const roleChange = await editor.agent
      .patch(`/api/workspaces/${workspaceId}/members/${viewerMemberId}`)
      .send({ role: "ADMIN" });
    expect(roleChange.status).toBe(403);
  });

  it("lets a member list workspace members once invited", async () => {
    const list = await editor.agent.get(`/api/workspaces/${workspaceId}/members`);
    expect(list.status).toBe(200);
    expect(list.body.members.map((m) => m.role).sort()).toEqual(["EDITOR", "OWNER", "VIEWER"]);
  });

  it("lets the owner change a member's role", async () => {
    const update = await owner.agent
      .patch(`/api/workspaces/${workspaceId}/members/${viewerMemberId}`)
      .send({ role: "ADMIN" });

    expect(update.status).toBe(200);
    expect(update.body.member.role).toBe("ADMIN");

    // revert for the rest of the suite
    await owner.agent
      .patch(`/api/workspaces/${workspaceId}/members/${viewerMemberId}`)
      .send({ role: "VIEWER" });
  });

  it("blocks setting a member's role to OWNER and changing the owner's own role", async () => {
    const invalidRole = await owner.agent
      .patch(`/api/workspaces/${workspaceId}/members/${editorMemberId}`)
      .send({ role: "OWNER" });
    expect(invalidRole.status).toBe(400);

    const ownerRow = (await owner.agent.get(`/api/workspaces/${workspaceId}/members`)).body.members.find(
      (m) => m.role === "OWNER"
    );

    const changeOwner = await owner.agent
      .patch(`/api/workspaces/${workspaceId}/members/${ownerRow.id}`)
      .send({ role: "ADMIN" });
    expect(changeOwner.status).toBe(400);
  });

  it("blocks a VIEWER from creating or editing files in the workspace", async () => {
    const create = await viewer.agent
      .post(`/api/workspaces/${workspaceId}/files`)
      .send({ name: "viewer.js", path: "viewer.js" });
    expect(create.status).toBe(403);

    const list = await viewer.agent.get(`/api/workspaces/${workspaceId}/files`);
    expect(list.status).toBe(200);
  });

  it("lets a member remove themselves (leave) but blocks removing others without manager role", async () => {
    const removeOther = await editor.agent.delete(
      `/api/workspaces/${workspaceId}/members/${viewerMemberId}`
    );
    expect(removeOther.status).toBe(403);

    const leave = await editor.agent.delete(
      `/api/workspaces/${workspaceId}/members/${editorMemberId}`
    );
    expect(leave.status).toBe(200);

    const list = await owner.agent.get(`/api/workspaces/${workspaceId}/members`);
    expect(list.body.members.some((m) => m.id === editorMemberId)).toBe(false);
  });

  it("blocks removing the workspace owner", async () => {
    const ownerRow = (await owner.agent.get(`/api/workspaces/${workspaceId}/members`)).body.members.find(
      (m) => m.role === "OWNER"
    );

    const remove = await owner.agent.delete(`/api/workspaces/${workspaceId}/members/${ownerRow.id}`);
    expect(remove.status).toBe(400);
  });
});
