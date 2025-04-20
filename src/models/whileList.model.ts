import { Schema, model } from "mongoose";
import { encryptData, decryptData } from "../utils/encription.helper";

const whiteListSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      set: (s: string) => encryptData(s),
      get: (s: string) => decryptData(s),
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const WhiteList = model("WhiteList", whiteListSchema);

export default WhiteList;

export type WhiteListType = {
  email: string;
  username: string;
};
