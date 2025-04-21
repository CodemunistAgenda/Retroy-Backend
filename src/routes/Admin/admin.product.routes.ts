import { Router } from "express";

import {
  getProductById,
  updateProduct,
  filterProducts,
  createProduct,
  restoreProduct,
  deleteProduct,
} from "../../controllers/Admin/admin.product.controller";
import { validateProduct, validateProductForUpdate, checkReason } from "../../middleware/Admin/product.middleware";
import upload from "../../middleware/uploads";

const router = Router();

router.get("/", filterProducts);
router.post("/", validateProduct, upload.array("images", 5), createProduct);
router.get("/:productId", getProductById);
router.get("/:productId/restore", restoreProduct);
router.patch("/:productId/update", validateProductForUpdate, updateProduct);
router.post("/:productId/delete", checkReason, deleteProduct);

export default router;
