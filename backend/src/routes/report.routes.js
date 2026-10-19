import { Router } from "express";
import { exportReport, feedback, getReport, listReports } from "../controllers/report.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", listReports);
router.get("/:id", getReport);
router.get("/:id/export/:format", exportReport);
router.post("/feedback", feedback);
export default router;
