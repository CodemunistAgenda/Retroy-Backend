import { Schema, model, Types, Document } from "mongoose";
import { onlyLetters as names } from "../utils/regex";

const addressSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["shipping", "billing", "privat", "custom"],
    required: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 50,
    validate: {
      validator: function (val: string) {
        return names.test(val);
      },
      message: "Street must contain only letters",
    },
  },
  houseNumber: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 4,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 50,
    validate: {
      validator: function (val: string) {
        return names.test(val);
      },
      message: "City must contain only letters",
    },
  },
  zipCode: {
    type: String,
    required: true,
    trim: true,
    minLength: 4,
    maxLength: 5,
  },
  country: String,
  label: String,
});

const Address = model("Address", addressSchema);

export default Address;

export type AddressType = {
  _id: string;
  userId: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  country?: string;
  label?: string;
  type: "shipping" | "billing" | "privat" | "custom";
};

export type AddressDocument = AddressType &
  Document & {
    _id: Types.ObjectId;
  };
