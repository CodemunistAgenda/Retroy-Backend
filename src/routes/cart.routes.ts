import { Router } from "express";
import {
  addToCart,
  getUserCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  preview,
} from "../controllers/cart.controller";
import {
  validateProductsForCartPreview,
  getAndValidateAdress,
  calculatePrices,
  generateShippingPreview,
} from "../middleware/cart.middleware";

const router = Router();

router
  .get("/", getUserCart)
  .get(
    "/preview",
    validateProductsForCartPreview,
    getAndValidateAdress,
    generateShippingPreview,
    calculatePrices,
    preview
  )
  .post("/add", addToCart)
  .patch("/:id/increase", increaseQuantity)
  .patch("/:id/decrease", decreaseQuantity)
  .delete("/:id/remove", removeFromCart)
  .delete("/clear", clearCart);

export default router;
