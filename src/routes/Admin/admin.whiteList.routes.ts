import { Router } from "express";

import {
  showWhiteList,
  deleteUserFromWhiteList,
  addUserToWhiteList,
} from "../../controllers/Admin/admin.whitelist.controlller";

const router = Router();

router.get("/", showWhiteList).post("/", addUserToWhiteList).delete("/:id", deleteUserFromWhiteList);

export default router;
