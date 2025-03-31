import mongoose from "mongoose";
import "dotenv/config";

const connect = async () => {
  const uri = process.env.DB_URI;

  if (!uri) {
    throw new Error("Error while connecting to MongoDB: DB_URI is not defined");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB successfully connected!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};

connect();
