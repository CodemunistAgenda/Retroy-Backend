import { Schema, model, Types } from "mongoose";

const cartSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User", // Verweis auf die User-Sammlung
      required: true,
    },
    items: [
      {
        product: {
          type: Types.ObjectId,
          ref: "Product", // Verweis auf ein Produkt
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
        priceAtAddition: {
          type: Number,
          required: true,
          default: 0, // Default value added to avoid validation errors
        },
        // Disable automatic generation of _id for subdocuments in the items array
        _id: false,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["open", "ordered", "cancelled"],
      default: "open",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model<CartType>("Cart", cartSchema);

export type CartType = {
  user: Types.ObjectId;
  items: {
    product: Types.ObjectId;
    quantity: number;
    priceAtAddition: number;
  }[];
  totalPrice: number;
  status: "open" | "ordered" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  _id: Types.ObjectId;
};
