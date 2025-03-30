import mongoose from "mongoose";
import "dotenv/config";

const connect = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("❌ MONGODB_URI .env dosyasında tanımlı değil!");
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB successfully connected!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
};

connect();