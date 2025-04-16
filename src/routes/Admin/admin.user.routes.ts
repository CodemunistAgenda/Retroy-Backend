import { Router } from "express";

import { adminUserUpdate, getUsers } from "../../controllers/Admin/admin.user.controller";
import { updateUserAdminMiddleware } from "../../middleware/Admin/update.users.middleware";

const router = Router();

router.get("/", getUsers);
router.patch("/:id", updateUserAdminMiddleware, adminUserUpdate);

export default router;
