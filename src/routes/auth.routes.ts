import { Router } from "express";

import { register, login, deleteUser, logout, refreshToken, getCurrentUser } from "../controllers/auth.controller.ts";
import { verifyUser } from "../controllers/verifyUser.ts";
import { adminAuth } from "../middleware/admin.only.ts";

const userRouter = Router();

userRouter
  .post("/register", register)
  .post("/login", adminAuth, login)
  // verify sendet, wenn aktiviert, eine Mail an den User mit einem Link ist aber bisher nur recht billig umgesetzt
  .get("/verify", verifyUser)
  // löscht alle Tokens des Users
  .post("/logout", logout)
  .get("/refresh", refreshToken)
  // markieren für den Delete
  .post("/delete/:id", deleteUser)

  // alle infos aber keine population
  .get("/me", getCurrentUser);

export default userRouter;

/* orhan admin */
