import { Schema, model, Types } from "mongoose";
import "dotenv/config.js";

import { encryptData, decryptData } from "../utils/helper.js";
import { onlyLetters as names, telNumber } from "../utils/regex.js";

const personalInfoSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 50,
    validate: {
      validator: function (val: string) {
        return names.test(val);
      },
      message: "Firstname must contain only letters",
    },
  },
  secondName: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 50,
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
    maxLength: 50,
    validate: {
      validator: function (val: string) {
        return names.test(val);
      },
      message: "Lastname must contain only letters",
    },
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
    minLength: 10,
    validator: {
      validator: function (val: string) {
        return telNumber.test(val);
      },
      message: "That is not a valid phone number",
    },
    set: (val: string) => encryptData(val),
    get: (val: string) => decryptData(val),
  },
});

const PersonalData = model("PersonalData", personalInfoSchema);

export default PersonalData;
