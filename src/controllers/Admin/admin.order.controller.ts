import { type Request, type Response } from "express";
import Order, { type OrderDoc } from "../../models/order.model";
import { errorResponse, successResponse } from "../../utils/helper.function";

/**
 * @desc Alle Bestellungen abrufen
 * @warnging Diese Route sollte nur von Admins und Moderatoren aufgerufen werden können.
 */

export const getAllOrders = async (_: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate({ path: "user", select: "username _id" }).populate("products.productId");
    return successResponse(res, 200, "Bestellungen erfolgreich geladen.", orders);
  } catch (err) {
    return errorResponse(res, 500, "Fehler beim Laden der Bestellungen.", err);
  }
};
