import { Router } from "express";
import authRoutes from "./auth.routes.ts";
import cartRoutes from "./cart.routes.ts";
import productRoutes from "./product.routes.ts";
import orderRoutes from "./order.routes.ts";
import profileRouter from "./profile.routes.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/cart", cartRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/profile", profileRouter);

export default router;
