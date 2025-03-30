import { Router } from "express";

import { register, login, deleteUser, restore } from "../controllers/userController.ts";
import { verifyUser } from "../controllers/verifyUser.ts";

const userRouter = Router();

userRouter
  .get("/", (req, res) => {
    res.send("Hello from user router");
  })
  .post("/register", register)
  .post("/login", login)
  .get("/verify", verifyUser)
  .post("/delete/:id", deleteUser)
  .post("/restore/:id", restore);

export default userRouter;
