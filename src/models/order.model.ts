import { Schema, model, Types, Document } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    // hier werden die Produkte aus dem Warenkorb eingefügt
    products: [
      {
        _id: { type: Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        name: { type: String, required: true },
        unitPrice: { type: String, required: true },
      },
    ],
    taxAmount: { type: Number, required: true },
    // hier wird der Gesamtbetrag des Warenkorbs gespeichert
    totalAmount: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    // hier wird der Gesamtbetrag des Warenkorbs + Versandkosten + Steuern gespeichert
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
    paymentMethod: {
      type: String,
      enum: ["credit_card", "paypal", "bank_transfer"],
      required: true,
    },
    paymentReference: {
      type: String,
      required: function (this: OrderDoc) {
        return this.paymentMethod !== "bank_transfer";
      },
    },
    paidAt: Date,
    cancel: {
      reason: { type: String, default: "" },
      date: { type: Date, default: null },
    },
    orderSpecials: [
      {
        type: { type: String, enum: ["danger", "fragile", "oversize"], default: "none" },
        count: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
        _id: false,
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

export type OrderDoc = Document & {
  user: Types.ObjectId;
  products: {
    _id: Types.ObjectId;
    quantity: number;
    name: string;
    unitPrice: string;
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
  shippingMethod: "standard" | "express" | "overnight";
  status: "pending" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "credit_card" | "paypal" | "bank_transfer" | "cash_on_delivery";
  paymentReference: string;
  paidAt?: Date;
  cancel: {
    reason: string;
    date: Date | null;
  };
  orderSpecials: {
    type: "danger" | "fragile" | "oversize" | "none";
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
