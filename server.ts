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
/* 
import WhiteList from "./src/models/whileList.model.ts";

WhiteList.create({
  email: "norman.tetzlaff@dci-student.org",
  username: "NormanT",
});
console.log("Whitelist created"); 
*/

/* app.use(
  cors({
    origin: "http://localhost:4001", // frontend URL
    credentials: true,
  })
); */

app.use(cors());

app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.startsWith("application/json")) {
    express.json()(req, res, next);
  } else {
    next(); // skip for multipart/form-data
  }
});

app.use(cookieParser()); // need to read the cookies to get the refresh token
// app.use(Limiter);  // Out of service for development

// here are the router routes added

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
