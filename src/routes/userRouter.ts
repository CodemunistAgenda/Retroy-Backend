import { register, login } from "../controllers/userController.ts";
import express, { Router } from "express";

const userRouter = Router();

userRouter.post("/register", register);
userRouter.post("/login", login);

export default userRouter;
