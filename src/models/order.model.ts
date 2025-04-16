import { Schema, model, Types } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        _id: { type: Types.ObjectId, ref: "Product", required: true },
        // name: { type: String, required: true },
        quantity: { type: Number, required: true },
        // price: { type: Number, required: true },
      },
    ],
    taxAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    finalAmount: { type: Number, required: true },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      houseNumber: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    billingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      houseNumber: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    shippingMethod: {
      type: String,
      enum: ["standard", "express", "overnight"],
      default: "standard",
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderSpecials: [
      {
        type: { type: String, enum: ["danger", "fragile", "oversize"], default: "none" },
        count: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
      },
    ],
    specialTotal: { type: Number, default: 0 },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model("Order", orderSchema);

export type OrderType = {
  user: Types.ObjectId;
  products: {
    _id: Types.ObjectId;
    quantity: number;
  }[];
  taxAmount: number;
  totalAmount: number;
  shippingCost: number;
  finalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    houseNumber: string;
    zipCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    houseNumber: string;
    zipCode: string;
  };
  shippingMethod: string;
  status: string;
  paymentStatus: string;
  orderSpecials: {
    type: string;
    count: number;
    price: number;
  }[];
  specialTotal: number;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  _id: Types.ObjectId;
};
