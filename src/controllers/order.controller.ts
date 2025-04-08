import Order from "../models/order.model";
import { type Request, type Response } from "express";

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
      specialTotal,
    } = req.body;

    // console.log("createOrder", req.body);
    console.log("billingAddress", billingAddress);

    const newOrder = new Order({
      user: id,
      products: cart.items,
      billingAddress,
      shippingAddress,
      shippingMethod,
      totalAmount,
      taxAmount,
      shippingCost,
      finalAmount,
      orderSpecials,
      specialTotal,
    });

    await newOrder.save();

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Bestellung konnte nicht erstellt werden.", error });
  }
};

/**
 * @desc Alle Bestellungen abrufen
 * @warnging Diese Route sollte nur von Admins und Moderatoren aufgerufen werden können.
 */

export const getAllOrders = async (_: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().populate({ path: "user", select: "username _id" }).populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Bestellungen konnten nicht geladen werden.", error });
  }
};

/**
 * @desc Bestellung nach ID abrufen
 */

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate("user").populate("products.productId");
    if (!order) {
      res.status(404).json({ message: "Bestellung nicht gefunden." });
      return;
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden der Bestellung.", error });
  }
};

export const getAllOrdersOfUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ user: userId }).populate("user").populate("products.productId");
    if (!orders) {
      res.status(404).json({ message: "Keine Bestellungen gefunden." });
      return;
    }
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Laden der Bestellungen.", error: err });
  }
};

/**
 * @desc Bestellung aktualisieren
 */

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      res.status(404).json({ message: "Bestellung nicht gefunden." });
      return;
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Bestellung konnte nicht aktualisiert werden.", error });
  }
};

/**
 * @desc Bestellung löschen
 */
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Bestellung nicht gefunden." });
      return;
    }
    res.status(200).json({ message: "Bestellung wurde gelöscht." });
  } catch (error) {
    res.status(500).json({ message: "Bestellung konnte nicht gelöscht werden.", error });
  }
};
