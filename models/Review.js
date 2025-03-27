import { model, Schema } from "mongoose";

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  editedAt: { type: Date, default: Date.now },
}, { timestamps: true });

reviewSchema.statics.calculateAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);
  return result.length ? { averageRating: result[0].averageRating, totalReviews: result[0].totalReviews } : { averageRating: 0, totalReviews: 0 };
};

const Review = model("Review", reviewSchema);
export default Review;


