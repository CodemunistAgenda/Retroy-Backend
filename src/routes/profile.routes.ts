import { Router } from "express";

import { authMiddleware } from "../middleware/jwtAuth.ts";

import { createProfile } from "../controllers/profile.controller.ts";

const profileRoutes = Router();

profileRoutes.post("/:id", authMiddleware, createProfile);

export default profileRoutes;
