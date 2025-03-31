import { Router } from "express";
import { addToCart, getUserCart } from "../controllers/cart.controller";

const router = Router();

router.get("/:userId", getUserCart);
router.post("/", addToCart);

export default router;
