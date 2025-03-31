import { Router } from "express";

import { register, login, deleteUser, restore, logout, refreshToken } from "../controllers/auth.controller.ts";
import { verifyUser } from "../controllers/verifyUser.ts";

const userRouter = Router();

userRouter
  .get("/", (_, res) => {
    res.send("Hello from user router");
  })
  .post("/register", register)
  .post("/login", login)
  .get("/verify", verifyUser)
  .post("/restore/:id", restore)
  .post("/logout", logout)
  .get("/refresh", refreshToken)
  .post("/delete/:id", deleteUser);

export default userRouter;
