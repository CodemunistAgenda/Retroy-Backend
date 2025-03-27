import { model, Schema } from "mongoose";

const paymentSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  invoice: { type: Schema.Types.ObjectId, ref: "Invoice" }, 
  amount: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 }, 
  paymentMethod: { type: String, enum: ["credit_card", "paypal", "stripe", "bank_transfer"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  refundStatus: { type: String, enum: ["none", "requested", "processed"], default: "none" }, 
  transactionId: { type: String, unique: true },
}, { timestamps: true });

const Payment = model("Payment", paymentSchema);
export default Payment;

