import { model, Schema } from "mongoose";

const orderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: Schema.Types.ObjectId, ref: "Company", required: true }, 
  products: [{
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["pending", "processing", "shipped", "delivered", "cancelled", "archived"], 
    default: "pending" 
  },
  shippingAddress: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  trackingNumber: { type: String },
  estimatedDelivery: { type: Date },
  isCancelled: { type: Boolean, default: false }
}, { timestamps: true });

export default model("Order", orderSchema);
