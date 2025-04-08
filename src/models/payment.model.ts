import { Schema, model, Types } from "mongoose";
import { encryptData, decryptData } from "../utils/encription.helper.ts";
import { email, iban } from "../utils/regex";

const paymentSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  primary: {
    type: String,
    enum: ["creditCard", "paypal", "bankTransfer"],
    required: true,
  },
  creditCard: {
    cardToken: {
      type: String,
      set: (val: string) => encryptData(val),
      get: (val: string) => decryptData(val),
    },
  },
  paypal: {
    email: {
      type: String,
      validate: {
        validator: function (val: string) {
          return email.test(val);
        },
        message: "Email is not valid",
      },
    },
  },
  bankTransfer: {
    bankAccountNumber: Number,
    bankName: String,
    iban: {
      type: String,
      validate: {
        validator: function (val: string) {
          return iban.test(val);
        },
        message: "Invalid iban",
      },
      set: (val: string) => encryptData(val),
      get: (val: string) => decryptData(val),
    },
    bic: String,
  },
  shippingAddress: {
    type: Schema.Types.Mixed,
    required: true,
  },
  billingAddress: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

const Payment = model("Payment", paymentSchema);

export default Payment;
