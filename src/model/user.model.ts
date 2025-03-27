import { Schema, model } from "mongoose";
import Profil from "./sensible.model.ts";
import { onlyLetters as names, email, userName } from "../utils/regex.ts";
// costum validation

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    validate: {
      validator: function (val: string) {
        return userName.test(val);
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
  profil: {
    type: Schema.Types.ObjectId,
    ref: "Profil",
  },
});

export default model("User", userSchema);
