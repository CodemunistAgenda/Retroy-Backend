import mongoose from "mongoose";
import "dotenv";

const connect = async () => {
  const uri = process.env.DB_URI;

  try {
    await mongoose.connect(uri as string);
    console.log("Connected to database");
  } catch (err) {
    console.error("Error connecting to database: ", (err as Error).message);
  }
};

connect();
