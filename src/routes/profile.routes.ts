import { Router } from "express";

import { getme, updatePersonalData } from "../controllers/profile.controller.ts";
import { validateProfile } from "../middleware/profile.middleware.ts";

const profileRoutes = Router();

// important to know the update Function also create the Profile, but it would be useless if i write 2 funktions
profileRoutes.post("/", validateProfile, updatePersonalData);
profileRoutes.get("/details", getme);

export default profileRoutes;
