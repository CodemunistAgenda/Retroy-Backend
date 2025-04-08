import { Schema, model } from "mongoose";

import { onlyLetters as names, letterAndPunctuation as description } from "../utils/regex";

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      validator: {
        validator: function (val: string) {
          return names.test(val);
        },
        message: (props: { value: string }) => `${props.value} is not a valid title!`,
      },
    },
    description: {
      type: String,
      trim: true,
      required: true,
      minLength: 10,
      maxLength: 500,
      validator: {
        validator: function (val: string) {
          return description.test(val);
        },
        message: (props: { value: string }) => `${props.value} is not a valid description!`,
      },
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
    color: {
      type: String,
      required: true,
      trim: true,
      validator: {
        validator: function (val: string) {
          return names.test(val);
        },
        message: (props: { value: string }) => `${props.value} is not a valid color!`,
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // TODO: add enum for categories
    },
    images: {
      type: [String],
      required: true,
      // genauer validator muss noch hinzugefügt werden
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    dimensions: {
      type: {
        width: { type: Number, required: true, min: 0 },
        height: { type: Number, required: true, min: 0 },
        depth: { type: Number, required: true, min: 0 },
      },
      required: true,
      validate: {
        validator: function (val: { width: number; height: number; depth: number }) {
          return (
            val &&
            typeof val.width === "number" &&
            val.width > 0 &&
            typeof val.height === "number" &&
            val.height > 0 &&
            typeof val.depth === "number" &&
            val.depth > 0
          );
        },
        message: (props: { value: { width: number; height: number; depth: number } }) =>
          `Invalid dimensions: width (${props.value.width}), height (${props.value.height}), depth (${props.value.depth}) must all be positive numbers.`,
      },
    },
    mainCategory: {
      type: String,
      required: true,
      trim: true,
    },
    collectionName: {
      type: String,
      required: true,
      trim: true,
    },
    specialDelivery: {
      type: [String],
      enum: ["oversize", "danger", "fragile", "none"],
      default: [],
    },
    subCollectionName: {
      type: String,
      required: true,
      trim: true,
    },
    salesperson: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model("Product", productSchema);
