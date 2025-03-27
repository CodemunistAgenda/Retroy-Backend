import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router
  .route("/profile")
  .get(getUserProfile)
  .put(updateUserProfile);


router.get("/users", getUsers);

router
  .route("/users/:id")
  .get(getUserById)
  .delete(deleteUser);


export default router;
