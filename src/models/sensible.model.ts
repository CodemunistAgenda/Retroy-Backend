import { Schema, model } from "mongoose";
import crypto from "crypto-js";
import "dotenv/config.js";
import { onlyLetters as names, email, iban } from "../utils/regex";

const encriptionKey = process.env.ENCRYPTION_KEY;

const encryptData = (data: string) => {
  const cipher = crypto.AES.encrypt(data, encriptionKey as string).toString();
  return cipher;
};

const decryptData = (data: string) => {
  const bytes = crypto.AES.decrypt(data, encriptionKey as string);
  const decryptedData = bytes.toString(crypto.enc.Utf8);
  return decryptedData;
};

const addressSchema = new Schema({
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
  zip: {
    type: String,
    required: true,
    trim: true,
    minLength: 4,
    maxLength: 5,
  },
});

const sensibleDataSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 20,
    validate: {
      validator: function (val: string) {
        return names.test(val);
      },
      message: "Firstname must contain only letters",
    },
  },
  secondname: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 20,
    validate: {
      validator: function (val: string) {
        return names.test(val);
      },
      message: "Secondname must contain only letters",
    },
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 20,
    validate: {
      validator: function (val: string) {
        return names.test(val);
      },
      message: "Lastname must contain only letters",
    },
  },
  address: {
    type: addressSchema,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    minLength: 10,
    maxLength: 15,
    set: (val: string) => encryptData(val),
    get: (val: string) => decryptData(val),
  },
  paymentMethods: [
    {
      methode: {
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
        expirationDate: Date,
        cardType: String,
      },
      paypal: {
        type: String,
        validate: {
          validator: function (val: string) {
            return email.test(val);
          },
          message: "Invalid email",
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
          bic: String,
        },
      },
      Primary: {
        type: String,
        enum: ["paypal", "creditCard", "bankTransfer"],
        default: null,
      },
    },
  ],
  shippingAddress: {
    type: addressSchema,
    required: true,
  },
  billingAddress: {
    type: addressSchema,
    required: true,
  },
});

const SensibleData = model("Profil", sensibleDataSchema);

export default SensibleData;
