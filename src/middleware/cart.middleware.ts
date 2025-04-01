import { type Request, type Response, type NextFunction } from "express";
import Cart from "../models/cart.model";
import Product from "../models/product.model";

export const extractUserIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const userId = (req as any).user?.id;

  if (!userId) {
    res.status(400).json({ message: "User ID is required" });
    return;
  }

  req.body.userId = userId;
  next();
};

export const findCartMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.body.userId }).populate("items.product");

    if (!cart) {
      cart = new Cart({ user: req.body.userId, items: [], totalPrice: 0 });
      await cart.save();
    }

    req.body.cart = cart;
    next();
  } catch (error) {
    res.status(500).json({ message: "Error retrieving cart", error });
  }
};

export const findProductMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    req.body.product = product;
    next();
  } catch (error) {
    res.status(500).json({ message: "Error retrieving product", error });
  }
};
