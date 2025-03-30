import { Router } from "express";
import { register, login, deleteUser, restore } from "../controllers/auth.controller";

const router = Router();

router.post("/register", register).post("/login", login).post("/delete/:id", deleteUser).post("/restore/:id", restore);

export default router;
