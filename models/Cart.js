import { model, Schema } from "mongoose";

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
      title: { type: String, required: true },
      images: [{ type: String }],
    }
  ]
}, { timestamps: true });

const Cart =model("Cart", cartSchema);
export default Cart;
