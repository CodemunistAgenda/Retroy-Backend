import { Router } from "express";

import { getme, updatePersonalData } from "../controllers/profile.controller.ts";
import { validateProfile } from "../middleware/profile.middleware.ts";

const profileRoutes = Router();

profileRoutes.post("/", validateProfile, updatePersonalData);
profileRoutes.get("/details", getme);

export default profileRoutes;
