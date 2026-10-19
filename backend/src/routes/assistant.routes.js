import { Router } from "express";
import { assistantAnalyze, assistantChat } from "../controllers/assistant.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.post("/chat", assistantChat);
router.post("/analyze", assistantAnalyze);
export default router;
