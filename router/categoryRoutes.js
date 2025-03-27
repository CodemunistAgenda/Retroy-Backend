import express from "express";
import { 
  fetchCategories, 
  createCategory, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from "../controllers/categoryController.js";

const router = express.Router();


router.route("/").post(createCategory).get(fetchCategories);
router.route("/:id").get(getCategoryById).put(updateCategory).delete(deleteCategory);

export default router;
