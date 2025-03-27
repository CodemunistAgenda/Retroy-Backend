import express from "express";
import userRoutes from "./userRoutes.js";
import productRoutes from "./productRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import cartRoutes from "./cartRoutes.js";
import orderRoutes from "./orderRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import uploadRoutes from "./uploadRoutes.js";
import wishlistRoutes from "./wishlistRoutes.js";


const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", userRoutes);
router.use("/cart", userRoutes);
router.use("/category", userRoutes);
router.use("/order", userRoutes);
router.use("/payment", userRoutes);
router.use("/product", userRoutes);
router.use("/review", userRoutes);
router.use("/upload", userRoutes);
router.use("/wishlist", userRoutes);

export default router;
