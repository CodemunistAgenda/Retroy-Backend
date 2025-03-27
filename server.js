import express from "express";
import cors from "cors";
import "dotenv/config.js";
import "./utils/connect.js";
import routes from "./router/index.js";


const app = express();

app.use(express.json());

app.use(cors());

const port = process.env.PORT || 5000;

app.use("/api", routes);

app.listen(port, () => {
  console.log(`server working on ${port} port!`);
});
