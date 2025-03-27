import mongoose from "mongoose";
import "dotenv/config";

export default async function connect() {
  const uri = process.env.MONGO_URI;
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.log("Error to connect with MongoDB", error);
  }
}
connect();
