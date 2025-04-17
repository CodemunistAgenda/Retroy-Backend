import { Router } from "express";

import {
  adminUserUpdate,
  deleteUserByAdmin,
  getUsers,
  restoreUserByAdmin,
} from "../../controllers/Admin/admin.user.controller";
import { updateUserAdminMiddleware } from "../../middleware/Admin/update.users.middleware";

const router = Router();

router.get("/", getUsers);
router.patch("/:id", updateUserAdminMiddleware, adminUserUpdate);
router.post("/:id/delete", deleteUserByAdmin);
router.post("/:id/restore", restoreUserByAdmin);

export default router;
