import { Router } from "express";

import { updatePersonalData } from "../controllers/profile.controller.ts";
import { validateProfile } from "../middleware/profile.middleware.ts";

const profileRoutes = Router();

profileRoutes.post("/", validateProfile, updatePersonalData);

export default profileRoutes;
