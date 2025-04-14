import express from "express";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";

import "./src/config/connect.ts";
import routes from "./src/routes/index.ts";

const Limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // IP limit
  message: "Too many requests, please try again later.",
});

// variables
const app = express();
const PORT = process.env.PORT || 5001;

// here middleware adden

/* import WhiteList from "./src/models/whileList.model.ts";

WhiteList.create({
  email: "norman.tetzlaff@dci-student.org",
  username: "NormanT",
  password: "Gr33nfr0g#s4v3",
}); */

app.use(
  cors({
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser()); // need to read the cookies to get the refresh token
// app.use(Limiter);  // Out of service for development

// here are the router routes added

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
