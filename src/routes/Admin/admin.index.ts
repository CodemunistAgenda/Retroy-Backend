import { Router } from "express";

import whiteListRouter from "./admin.whiteList.routes";

const router = Router();

router.post("/", (_, res) => {
  res.status(200).json({
    message: "Admin route",
  });
});

router.get("/whitelist", whiteListRouter);

export default router;
