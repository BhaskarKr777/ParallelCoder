import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  create,
  listMine,
  getOne,
  listWorkspaceMembers,
  inviteMember,
  updateRole,
  removeWorkspaceMember,
} from "../controllers/workspace.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", create);
router.get("/", listMine);
router.get("/:workspaceId", getOne);
router.get("/:workspaceId/members", listWorkspaceMembers);
router.post("/:workspaceId/members", inviteMember);
router.patch("/:workspaceId/members/:memberId", updateRole);
router.delete("/:workspaceId/members/:memberId", removeWorkspaceMember);

export default router;
