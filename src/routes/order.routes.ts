import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/order.controller";

const router = Router();

router.route("/").get(getAllOrders).post(createOrder);
router.route("/:id").get(getOrderById).put(updateOrder).delete(deleteOrder);

export default router;
