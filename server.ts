import express from "express";
import "dotenv/config.js";
import cors from "cors";
import "./src/config/connect.ts";
import userRouter from "./src/routes/userRouter.ts";

// variables
const app = express();
const PORT = process.env.PORT || 5001;

// here middleware adden

app.use(cors());
app.use(express.json());

// auth routes

// app.use("/api/auth", authRouter); // wichtig für JWT

// here are the router routes added

app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
