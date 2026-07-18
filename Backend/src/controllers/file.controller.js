import { z } from "zod";

import { assertMembership } from "../services/workspace.service.js";
import {
  listFiles,
  createFile,
  updateFile,
  deleteFile,
  getFileWorkspaceId,
} from "../services/file.service.js";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  path: z.string().max(300).optional(),
  language: z.string().max(40).optional(),
});

const updateSchema = z.object({
  content: z.string().optional(),
  name: z.string().min(1).max(100).optional(),
});

export const list = async (req, res, next) => {
  try {
    await assertMembership(req.user.id, req.params.workspaceId);
    const result = await listFiles(req.params.workspaceId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    await assertMembership(req.user.id, req.params.workspaceId);
    const data = createSchema.parse(req.body);
    const file = await createFile(req.params.workspaceId, data);
    res.status(201).json({ success: true, file });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const workspaceId = await getFileWorkspaceId(req.params.fileId);
    await assertMembership(req.user.id, workspaceId);
    const data = updateSchema.parse(req.body);
    const file = await updateFile(req.params.fileId, data);
    res.status(200).json({ success: true, file });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.issues[0].message });
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const workspaceId = await getFileWorkspaceId(req.params.fileId);
    await assertMembership(req.user.id, workspaceId);
    await deleteFile(req.params.fileId);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
