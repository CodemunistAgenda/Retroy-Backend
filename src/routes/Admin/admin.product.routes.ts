import { Router } from "express";

import {
  getProductsOfUser,
  getProductById,
  updateUserProduct,
  filterProducts,
  deleteUserProduct,
} from "../../controllers/Admin/admin.product.controller";
import { validateProductForUpdate } from "../../middleware/product.middleware";
import { checkReason } from "../../middleware/Admin/admin.product.middleware";

const router = Router();

router.get("/", filterProducts);
router.get("/:id/all", getProductsOfUser);
router
  .route("/:id")
  .get(getProductById)
  .patch(validateProductForUpdate, updateUserProduct)
  .post(checkReason, deleteUserProduct);

export default router;
