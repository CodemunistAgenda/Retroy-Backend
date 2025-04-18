import { Router } from "express";
import {
  addToCart,
  getUserCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller";

import protect from "../middleware/jwtAuth.ts";

const router = Router();

router
  .get("/", getUserCart)
  .post("/add", addToCart)
  .patch("/:id/increase", increaseQuantity)
  .patch("/:id/decrease", decreaseQuantity)
  .delete("/:id/remove", removeFromCart)
  .delete("/clear", clearCart);

export default router;
