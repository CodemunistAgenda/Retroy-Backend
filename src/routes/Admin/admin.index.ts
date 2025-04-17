import { Router } from "express";

import whiteListRouter from "./admin.whiteList.routes";
import userRouter from "./admin.user.routes";
import productRouter from "./admin.product.routes";

const router = Router();

router.post("/", (_, res) => {
  res.status(200).json({
    message: "Admin route",
  });
});

router.use("/whitelist", whiteListRouter);
router.use("/users", userRouter);
router.use("/products", productRouter);

export default router;
