import { Router } from "express";
import { cleanUnUsedImages } from "../../controllers/Admin/admin.clean.controller";

const router = Router();

router.get("/images", cleanUnUsedImages);

export default router;
