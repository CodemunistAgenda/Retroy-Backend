import { Router } from "express";

import {
  register,
  login,
  deleteUser,
  restore,
  logout,
  refreshToken,
  getCurrentUser,
} from "../controllers/auth.controller.ts";
import { verifyUser } from "../controllers/verifyUser.ts";
import { adminAuth } from "../middleware/admin.only.ts";

const userRouter = Router();

userRouter
  .post("/register", register)
  .post("/login", adminAuth, login)
  .get("/verify", verifyUser)
  .post("/restore/:id", restore)
  .post("/logout", logout)
  .get("/refresh", refreshToken)
  .post("/delete/:id", deleteUser)
  .get("/me", getCurrentUser);

export default userRouter;
