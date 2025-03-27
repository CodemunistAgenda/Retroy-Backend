import express from "express";
import { 
  fetchProducts, 
  createProduct, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} from "../controllers/productController.js";

const router = express.Router();

router.route("/").post(createProduct).get(fetchProducts);
router.route("/:id").get(getProductById).put(updateProduct).delete(deleteProduct);

export default router;
