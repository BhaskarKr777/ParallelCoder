import { Router } from "express";

import { requireAuth } from "../middleware/auth.middleware.js";
import { create, listMine } from "../controllers/workspace.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", create);
router.get("/", listMine);

export default router;
