import { Router } from "express";

import {
  getProductsOfUser,
  getProductById,
  updateUserProduct,
  filterProducts,
  deleteUserProduct,
  restoreUserProduct,
} from "../../controllers/Admin/admin.product.controller";
import { validateProductForUpdate } from "../../middleware/product.middleware";
import { checkReason } from "../../middleware/Admin/admin.product.middleware";

const router = Router();

router.get("/", filterProducts);
router.get("/:userId/all", getProductsOfUser);
router.get("/:productId/restore", restoreUserProduct);
router.get("/:productId", getProductById);
router.patch("/:productId/update", validateProductForUpdate, updateUserProduct);
router.post("/:productId/delete", checkReason, deleteUserProduct);

export default router;
