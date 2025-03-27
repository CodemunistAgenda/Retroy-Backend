import { Schema, model } from "mongoose";

// costum validation

const names = /^[A-Za-zÄÖÜäöüßÉéÈèȨȩÑñÇç\- ]+$/;
const email = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const userName = /^[A-Za-z0-9._-]+$/;

const userSchema = new Schema({
  firstName: {
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
  secondName: {
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
  lastName: {
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
});

export default model("User", userSchema);
