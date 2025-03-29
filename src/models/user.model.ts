import { Schema, model, Document } from "mongoose";

// ✏️ Regex-Validierung
const names = /^[\p{L}\p{M}\- ]+$/u; // Unicode-Unterstützung (ä, ö, ü, ß, ç, ñ usw.)
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const userNameRegex = /^[A-Za-z0-9._-]+$/;

// 📌 User Interface mit Mongoose-Document-Erweiterung
export interface IUser extends Document {
  firstName: string;
  secondName?: string;
  lastName: string;
  email: string;
  password: string;
  userName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 📦 User Schema
const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
      validate: {
        validator: (val: string) => names.test(val),
        message: "Vorname darf nur Buchstaben enthalten",
      },
    },
    secondName: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 20,
      validate: {
        validator: (val: string) => names.test(val),
        message: "Zweitname darf nur Buchstaben enthalten",
      },
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
      validate: {
        validator: (val: string) => names.test(val),
        message: "Nachname darf nur Buchstaben enthalten",
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (val: string) => emailRegex.test(val),
        message: "Ungültige E-Mail-Adresse",
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
        validator: (val: string) => userNameRegex.test(val),
        message: "Ungültiger Benutzername",
      },
    },
  },
  {
    timestamps: true, // erstellt automatisch createdAt & updatedAt
  }
);

const User = model<IUser>("User", userSchema);
export default User;
