import Order from "../models/order.model";
import { type Request, type Response } from "express";
import Product from "../models/product.model";
import { errorResponse, successResponse } from "../utils/helper.function";

/**
 * @desc Bestellung erstellen
 * @route POST /api/orders
 */

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.user?.id;
    const {
      cart,
      billingAddress,
      shippingAddress,
      shippingMethod,
      totalAmount,
      taxAmount,
      shippingCost,
      finalAmount,
      orderSpecials,
      paidmentMethod,
      paymentRefference,
      specialTotal,
    } = req.body;

    // wir checken hier noch schnell die payment methode
    if (!["creditcard", "paypal", "banktransfer"].includes(paidmentMethod))
      return errorResponse(res, 400, "Zahlungsmethode nicht verfügbar");

    const newOrder = new Order({
      user: id,
      products: cart.items,
      billingAddress,
      shippingAddress,
      shippingMethod,
      totalAmount,
      taxAmount,
      shippingCost,
      paidmentMethod,
      paymentRefference,
      finalAmount,
      orderSpecials,
      specialTotal,
    });

    await newOrder.save();

    const products = req.body.cart.items;

    try {
      for (const item of products) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
    } catch (error) {
      return errorResponse(res, 500, "Fehler beim Aktualisieren des Lagerbestands.", error);
    }

    return successResponse(res, 201, "Bestellung erfolgreich erstellt.", newOrder);
  } catch (error) {
    return errorResponse(res, 500, "Fehler beim Erstellen der Bestellung.", error);
  }
};

/**
 * @desc Bestellung nach ID abrufen
 */

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;

    const order = await Order.findById(orderId).populate("user").populate("products.productId");

    if (!order || userId?.toString() !== order?.user.toString()) {
      return errorResponse(res, 404, "No order under this id");
    }

    return successResponse(res, 200, "Bestellung erfolgreich geladen.", order);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden der Bestellung.", error });
  }
};

export const getAllOrdersOfUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ user: userId }).populate("user").populate("products.productId");

    if (!orders) return errorResponse(res, 404, "No orders found for this user");
    return successResponse(res, 200, "Orders found", orders);
  } catch (err) {
    return errorResponse(res, 500, "Error while loading orders", err);
  }
};

/**
 * @desc Bestellung löschen
 */
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orderId = req.params.id;
    const userId = req.user?.id;

    const order = await Order.findById(orderId);
    if (!order) return errorResponse(res, 404, "No order under this id");
    if (userId?.toString() !== order?.user.toString()) {
      return errorResponse(res, 403, "You are not allowed to cancel this order");
    }
    if (order.status === "shipped") return errorResponse(res, 400, "Order already shipped");
    if (order.status === "cancelled") return errorResponse(res, 400, "Order already cancelled");

    order.status = "cancelled";
    order.cancel = {
      reason: req.body.reason,
      date: new Date(),
    };
    await order.save();
    return successResponse(res, 200, "Order succesfully cancelled.", order);
  } catch (err) {
    return errorResponse(res, 500, "Error while cancelling the Order.", err);
  }
};
