import express from "express";
import "dotenv/config.js";
import cors from "cors";
import "./src/config/connect.ts";
import routes from "./src/routes/index.ts";

// variables
const app = express();
const PORT = process.env.PORT || 5001;

// here middleware adden

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
