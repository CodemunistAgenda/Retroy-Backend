import { type Request, type Response } from "express";

import Cart from "../models/cart.model.ts";
import Product from "../models/product.model.ts";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

interface CartItem {
  _id: string;
  quantity: number;
  priceAtAddition: number;
  totalPriceAtAddition: number;
}

export const getUserCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }
    console.log("userId", userId);

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      const newCart = new Cart({ userId, items: [] });
      await newCart.save();
      res.status(201).json(newCart);
      return;
    }
    let totalPrice = 0;
    if (cart.items.length !== 0) {
      totalPrice = cart.items.reduce((total, item) => {
        return total + item.quantity * (item.product ? item.priceAtAddition : 0);
      }, 0);
    }

    cart.totalPrice = totalPrice;
    await cart.save();

    res.json(cart);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const { productId, quantity } = req.body;
    if (!productId || quantity <= 0) {
      res.status(400).json({ message: "Product ID and quantity are required" });
      return;
    }

    const product = await Product.findById(productId);
    console.log("product", product);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ message: `There are only ${product.stock} left, you cant add more` });
      return;
    }

    const priceNow = product.price;

    let cart = await Cart.findOne({ user: userId });
    console.log("cart", cart);
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.findIndex((item) => item.product.toString() === productId);
    console.log("product", product);
    if (existingItem > -1 && cart.items[existingItem]) {
      cart.items[existingItem].quantity += quantity;
    } else {
      cart.items.push({ product, quantity, priceAtAddition: priceNow, totalPriceAtAddition: priceNow * quantity });
    }

    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * item.priceAtAddition;
    }, 0);

    cart.totalPrice = parseFloat(cart.totalPrice.toFixed(2));
    await cart.save();

    res.status(201).json({
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({ message: "Fehler beim Hinzufügen zum Warenkorb", error });
  }
};

export const increaseQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const { productId } = req.params;
    console.log("productId", productId);
    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const cart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    const itemIndex = cart.items.findIndex((item) => (item.product as CartItem)._id.toString() === productId);
    console.log(cart.items);
    console.log("itemIndex", itemIndex);

    if (itemIndex === -1) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }
    if (cart.items[itemIndex] !== undefined) {
      if (cart.items[itemIndex].quantity >= (cart.items[itemIndex].product as any).stock) {
        res.status(400).json({ message: "Cannot increase quantity beyond stock" });
        return;
      }

      cart.items[itemIndex].quantity += 1;
      cart.items[itemIndex].priceAtAddition =
        cart.items[itemIndex].quantity * (cart.items[itemIndex].product as any).price;

      cart.totalPrice = cart.items.reduce((total, item) => {
        return total + item.quantity * item.priceAtAddition;
      }, 0);
    }

    await cart.save();

    res.json({
      message: "Quantity increased",
      cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Error increasing quantity", err });
  }
};

export const decreaseQuantity = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user?.id;

    if (!user) {
      res.status(400).json({ message: "User Id is required" });
      return;
    }

    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const cart = await Cart.findOne({ user }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      res.status(404).json({ message: "Cart not found or empty" });
      return;
    }

    const itemIndex = cart.items.findIndex((item) => (item.product as CartItem)._id.toString() === productId);
    if (itemIndex === -1) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }

    if (cart.items[itemIndex]) {
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        cart.items.splice(itemIndex, 1);
      }

      cart.totalPrice = cart.items.reduce((total, item) => {
        return total + item.quantity * item.priceAtAddition;
      }, 0);
      await cart.save();
    }

    res.json({
      message: "Product removed from cart",
      cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Error decreasing quantity", err });
  }
};

export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user?.id;
    if (!user) {
      res.status(400).json({ message: "User Id is required" });
      return;
    }
    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const cart = await Cart.findOne({ user }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      res.status(404).json({ message: "Cart not found or empty" });
      return;
    }
    const itemIndex = cart.items.findIndex((item) => (item.product as CartItem)._id.toString() === productId);
    if (itemIndex === -1) {
      res.status(404).json({ message: "Item not found in cart" });
      return;
    }
    cart.items.splice(itemIndex, 1);
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * item.priceAtAddition;
    }, 0);
    await cart.save();
    res.json({
      message: "Item removed from cart",
      cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Error removing item from cart", err });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user?.id;
    if (!user) {
      res.status(400).json({ message: "User Id is required" });
      return;
    }

    const cart = await Cart.findOne({ user });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
    cart.items.splice(0, cart.items.length);
    cart.totalPrice = 0;
    await cart.save();
    res.json({
      message: "Cart cleared",
      cart,
    });
  } catch (err) {
    res.status(500).json({ message: "Error clearing cart", err });
  }
};
