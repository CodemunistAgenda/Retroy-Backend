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
    images: [String],
    mainCategory: {
      type: String,
      required: true,
      trim: true,
    },
    collectionName:{
      type: String,
      required: true,
      trim: true,
    },
    subCollectionName:{
      type: String,
      required: true,
      trim: true,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model("Product", productSchema);
