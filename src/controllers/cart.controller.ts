import Cart from "../models/cart.model";
import { Request, Response } from "express";


export const getUserCart = async (req: Request, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, items: [] });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Laden des Warenkorbs" });
  }
};


export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId, productId, quantity, price, title, image } = req.body;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity, price, title, image }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price, title, image });
      }
      await cart.save();
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Hinzufügen zum Warenkorb" });
  }
};
