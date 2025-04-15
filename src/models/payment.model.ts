import { Schema, model, Types } from "mongoose";
import { encryptData, decryptData } from "../utils/encription.helper.ts";
import { email, iban } from "../utils/regex";

const paypalSchema = new Schema(
  {
    email: {
      type: String,
      set: (val: string) => encryptData(val),
      get: (val: string) => decryptData(val),
    },
  },
  { _id: false }
);

const creditCardSchema = new Schema(
  {
    cardToken: {
      type: String,
      set: (val: string) => encryptData(val),
      get: (val: string) => decryptData(val),
    },
  },
  { _id: false }
);

const bankTransferSchema = new Schema(
  {
    iban: {
      type: String,
      set: (val: string) => encryptData(val),
      get: (val: string) => decryptData(val),
    },
    bic: String,
    bankName: String,
    bankAccountNumber: Number,
  },
  { _id: false }
);
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
  creditCard: creditCardSchema,
  paypal: paypalSchema,
  bankTransfer: bankTransferSchema,
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

paymentSchema.pre("save", function (next) {
  if (this.bankTransfer?.iban) {
    if (iban.test(this.bankTransfer.iban)) {
      console.log("valid iban");
      next();
    }
    next(new Error("Invalid iban"));
  }

  if (this.paypal?.email) {
    if (email.test(this.paypal.email)) {
      console.log("valid email");
      next();
    }

    next(new Error("Invalid email"));
  }
});
