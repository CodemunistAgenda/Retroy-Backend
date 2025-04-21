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
    origin: "http://localhost:3000", // frontend URL
    credentials: true,
  })
); */

app.use(cors());

app.use(express.json());
app.use(cookieParser()); // need to read the cookies to get the refresh token
// app.use(Limiter);  // Out of service for development

// here are the router routes added

app.post("/", (req, res) => {
  console.log("req vom Frontend");
  console.log("req.body: ", req.body);

  res.status(200).json({
    message: "Hello from the API",
    data: req.body,
  });
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
