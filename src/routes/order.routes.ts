import { Router } from "express";
import { createOrder, getOrderById, cancelOrder, getAllOrders } from "../controllers/order.controller";

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
    // fetcht den Cart und dessen Produkte
    validateProductsForOrder,
    // holt die Adresse und validiert sie
    getAndValidateAdress,

    // ausrechnen der aktuellen preise
    calculatePrices,
    // ausrechnen der Versandkosten
    calculateShippingCost,
    // sicherstellen einer gültigen Zahlungsmethode
    validatePayment,
    // und erstelle die Bestellung
    createOrder
  );

// holen der Bestellungen /  und abbrechen einer Bestellung mit möglicher Begründung
router.route("/:id").get(getAllOrders).get(getOrderById).patch(valReason, cancelOrder);

export default router;
