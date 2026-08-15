import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import {
  create,
  listMine,
  getOne,
  listWorkspaceMembers,
  inviteMember,
  createInvite,
  acceptInvite,
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
router.post("/:workspaceId/invites", createInvite);
router.post("/invites/accept", acceptInvite);
router.patch("/:workspaceId/members/:memberId", updateRole);
router.delete("/:workspaceId/members/:memberId", removeWorkspaceMember);

export default router;
