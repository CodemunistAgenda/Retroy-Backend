import mongoose from "mongoose";
import "dotenv/config";

const connect = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("❌ MONGODB_URI .env dosyasında tanımlı değil!");
  }

  if (!uri) {
    throw new Error("Error while connecting to MongoDB: DB_URI is not defined");
  }

  try {
    await mongoose.connect(uri);
<<<<<<< HEAD
    console.log("MongoDB successfully connected!");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
=======
    console.log("✅ MongoDB successfully connected!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
>>>>>>> e2a478c4a22f34c74f0ddc8730c8d8871bcbeef8
  }
};

connect();