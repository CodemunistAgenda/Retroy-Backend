import { Router } from "express";
import { createOrder, getOrderById, cancelOrder, getAllOrdersOfUser } from "../controllers/order.controller";

import {
  validateProductsForOrder,
  getAndValidateAdress,
  calculatePrices,
  calculateShippingCost,
  validatePayment,
  valReason,
} from "../middleware/order.middleware.ts";

const router = Router();

router
  .route("/")

  .post(
    validateProductsForOrder,
    getAndValidateAdress,
    calculatePrices,
    calculateShippingCost,
    validatePayment,
    createOrder
  );

router.route("/:id").get(getAllOrdersOfUser).get(getOrderById).patch(valReason, cancelOrder);

export default router;
