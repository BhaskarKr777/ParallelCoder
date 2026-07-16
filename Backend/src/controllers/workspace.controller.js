import { z } from "zod";

import { createWorkspace, listWorkspacesForUser } from "../services/workspace.service.js";

const createSchema = z.object({
  name: z.string().min(2).max(60),
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
