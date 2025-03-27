import express from "express";
import "dotenv/config.js";
import cors from "cors";

// variables
const app = express();
const PORT = process.env.PORT || 5001;

// here middleware adden

app.use(cors());
app.use(express.json());

// here are the router routes added

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
