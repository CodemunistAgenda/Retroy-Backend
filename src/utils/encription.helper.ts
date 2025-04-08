import crypto from "crypto-js";
import "dotenv/config.js";

const encriptionKey = process.env.ENCRYPTION_KEY;

export const encryptData = (data: string) => {
  const cipher = crypto.AES.encrypt(data, encriptionKey as string).toString();
  return cipher;
};

export const decryptData = (data: string) => {
  const bytes = crypto.AES.decrypt(data, encriptionKey as string);
  const decryptedData = bytes.toString(crypto.enc.Utf8);
  return decryptedData;
};
