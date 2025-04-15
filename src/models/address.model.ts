import { Schema, model, Types } from "mongoose";
import { onlyLetters as names } from "../utils/regex";

const addressSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
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
});

const Address = model("Address", addressSchema);

export default Address;

export type AddressType = {
  userId: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
};
