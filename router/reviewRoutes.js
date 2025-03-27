import express from "express";
import { 
  fetchReviews, 
  fetchProductReviews, 
  addReview, 
  updateReview, 
  deleteReview, 
  getReviewsByUser, 
  deleteAllReviewsByProduct 
} from "../controllers/reviewController.js";

const router = express.Router();

router.route("/").get(fetchReviews).post(addReview);
router.route("/product/:productId").get(fetchProductReviews);
router.route("/user/:userId").get(getReviewsByUser);
router.route("/product/:productId").delete(deleteAllReviewsByProduct);
router.route("/:id").put(updateReview).delete(deleteReview);

export default router;
