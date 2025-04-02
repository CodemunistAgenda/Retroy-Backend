import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";

import { findProductById, validateProduct, validateProductForUpdate } from "../middleware/product.middleware.ts";
import protect from "../middleware/jwtAuth.ts";

const router = Router();

router.route("/").get(getAllProducts).post(protect, validateProduct, createProduct);
router
  .route("/:id")
  .get(findProductById, getProductById)
  .put(protect, findProductById, validateProductForUpdate, updateProduct)
  .delete(protect, findProductById, deleteProduct);

export default router;
