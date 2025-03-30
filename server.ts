import express from "express";
import rateLimit from "express-rate-limit";
import "dotenv/config.js";
import cors from "cors";
import "./src/config/connect.ts";
import routes from "./src/routes/index.ts";
import userRouter from "./src/routes/userRouter.ts";

const Limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // IP limit
  message: "Too many requests, please try again later.",
});

// variables
const app = express();
const PORT = process.env.PORT || 5001;

// here middleware adden

app.use(cors());
app.use(express.json());
// app.use(Limiter);  // Out of service for development

// here are the router routes added

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/user", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
