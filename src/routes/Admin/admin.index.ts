import { Router } from "express";

import whiteListRouter from "./admin.whiteList.routes";
import userRouter from "./admin.user.routes";
import productRouter from "./admin.product.routes";
import cleanRouter from "./admin.clean.routes";

const router = Router();

// diese muss noch geschützt werden
router.use("/whitelist", whiteListRouter);

// hier werden die User bearbeitet
router.use("/users", userRouter);

// hier werden die Produkte bearbeitet (create, update, delete)
router.use("/products", productRouter);

// hier ist nur eine Route hinter, aber damit es einheitlich ist habe ich es beibehalten
router.use("/clean", cleanRouter);

export default router;
