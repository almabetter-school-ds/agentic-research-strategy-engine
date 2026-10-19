import { Router } from "express";
import { createKnowledge, listKnowledge } from "../controllers/knowledge.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", listKnowledge);
router.post("/", requireRole("reviewer", "admin"), createKnowledge);
export default router;
