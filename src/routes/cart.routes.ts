import { Router } from "express";
import {
  addToCart,
  getUserCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller";

const router = Router();

router
  .get("/:Id", getUserCart)
  .post("/add/:id", addToCart)
  .patch("/increase/:productId", increaseQuantity)
  .patch("/decrease/:productId", decreaseQuantity)
  .delete("/remove/:productId", removeFromCart)
  .delete("/clear/:userId", clearCart);

export default router;
