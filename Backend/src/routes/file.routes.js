import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { list, create, update, remove } from "../controllers/file.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/workspaces/:workspaceId/files", list);
router.post("/workspaces/:workspaceId/files", create);
router.patch("/files/:fileId", update);
router.delete("/files/:fileId", remove);

export default router;
