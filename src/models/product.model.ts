import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },
    category: {
      type: String,
      required: true,
    },
    images: [String], 
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model("Product", productSchema);
