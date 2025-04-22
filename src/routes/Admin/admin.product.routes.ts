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
// ich muss noch prüfen bevor die bilder hochgeladen werden
router.get("/", filterProducts);
router.post("/", upload.fields([{ name: "images", maxCount: 5 }]), validateProduct, createProduct);
router.get("/:productId", getProductById);
router.get("/:productId/restore", restoreProduct);
router.patch(
  "/:productId/update",
  upload.fields([{ name: "images", maxCount: 5 }]),
  validateProductForUpdate,
  updateProduct
);
router.post("/:productId/delete", checkReason, deleteProduct);

export default router;
