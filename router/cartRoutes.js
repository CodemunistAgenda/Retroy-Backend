import express from "express";
import { 
  getUserCart, 
  addToCart, 
  increaseQuantity, 
  decreaseQuantity, 
  removeFromCart, 
  clearCart 
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/user",getUserCart);

router.post("/", addToCart);

router.patch("/increase/:productId", increaseQuantity);

router.patch("/decrease/:productId", decreaseQuantity);

router.delete("/remove/:productId", removeFromCart);

router.delete("/clear", clearCart);

export default router;

