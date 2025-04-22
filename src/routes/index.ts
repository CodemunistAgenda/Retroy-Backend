import { Router } from "express";

import protect from "../middleware/jwtAuth.ts";

import authRoutes from "./auth.routes.ts";
import cartRoutes from "./cart.routes.ts";
import productRoutes from "./product.routes.ts";
import orderRoutes from "./order.routes.ts";
import profileRouter from "./profile.routes.ts";
import adminRoutes from "./Admin/admin.index.ts";
import { roleCheck } from "../middleware/admin.only.ts";

const router = Router();

// login, register, refresh token, logout
router.use("/auth", authRoutes);

// products all, filter
router.use("/products", productRoutes);

// cart, zur Kasse (preview), add, remove, clear
router.use("/cart", protect, cartRoutes);

// warenkorb wird zum checkout als bestellung
router.use("/orders", protect, orderRoutes);

// profil erstellen und bearbeiten (1 Route) / getme route für details
router.use("/profile", protect, profileRouter);

// hier findet die eigentliche arbeit
router.use("/admin", protect, roleCheck, adminRoutes);

export default router;
