import { z } from "zod";

import {
  createWorkspace,
  listWorkspacesForUser,
  getWorkspaceForUser,
  listMembers,
  inviteMemberByEmail,
  createInviteCode,
  acceptInviteCode,
  updateMemberRole,
  removeMember,
  assertMembership,
  assertManager,
  getWorkspaceMember,
  MANAGER_ROLES,
} from "../services/workspace.service.js";

const createSchema = z.object({
  name: z.string().min(2).max(60),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).default("EDITOR"),
});

const roleSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
});

const inviteCodeSchema = z.object({
  role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).default("EDITOR"),
});

const acceptInviteSchema = z.object({
  code: z.string().min(12).max(128),
});

export const create = async (req, res, next) => {
  try {
    const { name } = createSchema.parse(req.body);
    const workspace = await createWorkspace(req.user.id, name);

    res.status(201).json({ success: true, workspace });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const listMine = async (req, res, next) => {
  try {
    const workspaces = await listWorkspacesForUser(req.user.id);
    res.status(200).json({ success: true, workspaces });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const workspace = await getWorkspaceForUser(req.user.id, req.params.workspaceId);
    res.status(200).json({ success: true, workspace });
  } catch (error) {
    next(error);
  }
};

export const listWorkspaceMembers = async (req, res, next) => {
  try {
    await assertMembership(req.user.id, req.params.workspaceId);
    const members = await listMembers(req.params.workspaceId);
    res.status(200).json({ success: true, members });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    await assertManager(req.user.id, req.params.workspaceId);
    const { email, role } = inviteSchema.parse(req.body);
    const member = await inviteMemberByEmail(req.params.workspaceId, email, role);

    res.status(201).json({ success: true, member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const createInvite = async (req, res, next) => {
  try {
    await assertManager(req.user.id, req.params.workspaceId);
    const { role } = inviteCodeSchema.parse(req.body);
    const invite = await createInviteCode(req.params.workspaceId, req.user.id, role);
    res.status(201).json({ success: true, invite });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const { code } = acceptInviteSchema.parse(req.body);
    const membership = await acceptInviteCode(req.user.id, code);
    res.status(201).json({ success: true, membership });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    await assertManager(req.user.id, req.params.workspaceId);
    const { role } = roleSchema.parse(req.body);
    const member = await updateMemberRole(req.params.workspaceId, req.params.memberId, role);

    res.status(200).json({ success: true, member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const removeWorkspaceMember = async (req, res, next) => {
  try {
    const requester = await assertMembership(req.user.id, req.params.workspaceId);
    const target = await getWorkspaceMember(req.params.workspaceId, req.params.memberId);

    const isSelf = target.userId === req.user.id;

    if (!isSelf && !MANAGER_ROLES.includes(requester.role)) {
      const error = new Error("Only workspace owners/admins can remove other members");
      error.status = 403;
      throw error;
    }

    await removeMember(req.params.workspaceId, req.params.memberId);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
