import { Router } from "express";
import { dashboard, operations } from "../controllers/dashboard.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", dashboard);
router.get("/operations", requireRole("admin"), operations);
export default router;
