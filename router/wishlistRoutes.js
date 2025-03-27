import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.route("/:userId")
  .get(getWishlist)
  .post(addToWishlist);

router.route("/:userId/:productId")
  .delete(removeFromWishlist);

export default router;
