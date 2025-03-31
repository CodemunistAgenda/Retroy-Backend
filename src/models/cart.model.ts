import { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, min: 1 },
        price: { type: Number, required: true },
        title: { type: String, required: true },
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default model("Cart", cartSchema);
