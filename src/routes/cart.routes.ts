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
  .use(protect)
  .get("/:id", getUserCart)
  .post("/add", addToCart)
  .patch("/increase/:productId", increaseQuantity)
  .patch("/decrease/:productId", decreaseQuantity)
  .delete("/remove/:productId", removeFromCart)
  .delete("/clear", clearCart);

export default router;
