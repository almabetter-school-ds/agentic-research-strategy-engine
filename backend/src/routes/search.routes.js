import { Router } from "express";
import { globalSearch } from "../controllers/search.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", globalSearch);
export default router;
