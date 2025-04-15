import { Schema, model } from "mongoose";
// costum validation
import { onlyLetters as names, email, username } from "../utils/regex.ts";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function (val: string) {
        return username.test(val);
      },
      message: "Invalid username",
    },
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,

    validate: {
      validator: function (val: string) {
        return email.test(val);
      },
      message: "Invalid email",
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 6,
    maxLength: 60,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  deleted: {
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    reason: { type: String, default: null },
    deletedBy: { type: String, default: null },
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
  },
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  favorites: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  role: {
    type: String,
    enum: ["user", "admin", "seller", "moderator"],
    default: "user",
  },
  profil: {
    type: Schema.Types.ObjectId,
    ref: "Profil",
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: "Address",
  },
  payment: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
  },
});

export default model("User", userSchema);

export type UserType = {
  _id: string;
  username: string;
  email: string;
  password: string;
  verified: boolean;
  deleted: {
    isDeleted: boolean;
    deletedAt: Date | null;
    reason: string | null;
    deletedBy: string | null;
  };
  cart: string;
  orders: string[];
  favorites: string[];
  role: "user" | "admin" | "seller" | "moderator";
  profil: string;
  address: string;
  payment: string;
};
