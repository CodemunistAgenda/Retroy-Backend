import { Router } from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  getAllOrdersOfUser,
} from "../controllers/order.controller";

import {
  validateProductsForOrder,
  getAndValidateAdress,
  calculatePrices,
  calculateShippingCost,
} from "../middleware/order.middleware.ts";

const router = Router();

router
  .route("/")
  .get(getAllOrders)

  .post(validateProductsForOrder, getAndValidateAdress, calculatePrices, calculateShippingCost, createOrder);

router.route("/:id").get(getAllOrdersOfUser).get(getOrderById).put(updateOrder).delete(deleteOrder);

export default router;
