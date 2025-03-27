import express from "express";
import { createPayment, getPayments, getPaymentById } from "../controllers/paymentController.js";

const router = express.Router();

router.route("/").post(createPayment).get(getPayments);
router.route("/:id").get(getPaymentById);

export default router;


