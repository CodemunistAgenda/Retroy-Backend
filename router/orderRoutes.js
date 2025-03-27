import express from "express";
import { 
  createOrder, 
  getUserOrders, 
  getAllOrders, 
  getOrderById, 
  updateOrderStatusOrCancel,
} from "../controllers/orderController.js";

const router = express.Router();

router.route("/")
  .post(createOrder)  
  .get(getUserOrders); 


router.route("/admin")
  .get(getAllOrders);

router.route("/:id")
  .get(getOrderById); 


router.route("/:id/status")
  .put(updateOrderStatusOrCancel);

export default router;

