import { Router } from "express";

import { getUsers } from "../../controllers/Admin/admin.user.controller";

const router = Router();

router.get("/", getUsers);

export default router;
