import { Router } from "express";

import { createProfile } from "../controllers/profile.controller.ts";

const profileRoutes = Router();

profileRoutes.post("/", createProfile);

export default profileRoutes;
