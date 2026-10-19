import { Router } from "express";
import multer from "multer";
import { deleteUpload, listUploads, uploadFiles } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024, files: 8 } });
router.use(requireAuth);
router.get("/", listUploads);
router.post("/", upload.array("files", 8), uploadFiles);
router.delete("/:id", deleteUpload);
export default router;
