import express, { Router } from "express";

import { register, login } from "../controllers/userController.ts";
import { verifyUser } from "../controllers/verifyUser.ts";

const userRouter = Router();

userRouter.post("/register", register).post("/login", login).get("/verify", verifyUser);

export default userRouter;
