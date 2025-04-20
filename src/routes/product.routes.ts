import { Router } from "express";
import { getAllProducts, getProductById } from "../controllers/product.controller";

import { findProductById } from "../middleware/Admin/product.middleware.ts";

const router = Router();

router.route("/").get(getAllProducts);
router.route("/:id").get(findProductById, getProductById);

export default router;
