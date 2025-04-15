import { Router } from "express";

import protect from "../middleware/jwtAuth.ts";

import authRoutes from "./auth.routes.ts";
import cartRoutes from "./cart.routes.ts";
import productRoutes from "./product.routes.ts";
import orderRoutes from "./order.routes.ts";
import profileRouter from "./profile.routes.ts";
import adminRoutes from "./Admin/admin.index.ts";
import { adminAuth, roleCheck } from "../middleware/admin.only.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/cart", protect, cartRoutes);
router.use("/orders", protect, orderRoutes);
router.use("/profile", protect, profileRouter);
router.use("/admin", protect, roleCheck, adminRoutes);

export default router;
