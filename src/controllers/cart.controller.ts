import { type Request, type Response } from "express";

import Cart from "../models/cart.model.ts";
import Product from "../models/product.model.ts";
import { errorResponse, successResponse } from "../utils/helper.function.ts";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const getUserCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) return errorResponse(res, 400, "User ID is required");

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "-deleted -isPublished -__v -createdAt -updatedAt -stock",
    });

    if (!cart) {
      const newCart = new Cart({ user: userId, items: [] });
      await newCart.save();
      return successResponse(res, 200, "Cart created", newCart);
    }
    let totalPrice = 0;
    if (cart.items.length !== 0) {
      totalPrice = cart.items.reduce((total, item) => {
        return total + item.quantity * (item.product ? item.priceAtAddition : 0);
      }, 0);
    }

    cart.totalPrice = totalPrice;
    await cart.save();

    return successResponse(res, 200, "Cart retrieved", cart);
  } catch (err) {
    return errorResponse(res, 500, "Error retrieving cart", err instanceof Error ? err.message : err);
  }
};

export const addToCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, 400, "User ID is required");

    const { productId, quantity } = req.body;
    if (!productId || quantity <= 0) return errorResponse(res, 400, "Product ID and quantity are required");

    const product = await Product.findById(productId);

    if (!product) return errorResponse(res, 404, "Product not found");

    if (product.stock < quantity) return errorResponse(res, 400, "Not enough stock available");

    const priceNow = product.price;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) cart = new Cart({ user: userId, items: [] });

    const existingItem = cart.items.findIndex((item) => item.product.toString() === productId);

    if (existingItem > -1 && cart.items[existingItem]) {
      cart.items[existingItem].quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAddition: priceNow,
      });
    }

    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * item.priceAtAddition;
    }, 0);

    cart.totalPrice = parseFloat(cart.totalPrice.toFixed(2));
    await cart.save();

    return successResponse(res, 200, "Product added to cart", cart);
  } catch (err) {
    return errorResponse(res, 500, "Error adding product to cart", err instanceof Error ? err.message : err);
  }
};

export const increaseQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) return errorResponse(res, 400, "User ID is required");

    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Product ID is required");

    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return errorResponse(res, 404, "Cart not found");

    const itemIndex = cart.items.findIndex((item: any) => item.product._id.toString() === id);
    if (itemIndex === -1) return errorResponse(res, 404, "Item not found in cart");

    if (cart.items[itemIndex] !== undefined) {
      const product = cart.items[itemIndex].product;

      const latestStock = await Product.findById(id);
      if (!latestStock) return errorResponse(res, 404, "Product not found");

      if (latestStock.stock <= 0) return errorResponse(res, 400, "Product is out of stock");

      cart.items[itemIndex].quantity += 1;

      cart.items[itemIndex].priceAtAddition = latestStock.price;

      cart.totalPrice = cart.items.reduce((total, item) => {
        return total + item.quantity * item.priceAtAddition;
      }, 0);
    }

    await cart.save();

    await Product.findByIdAndUpdate(id, { $inc: { stock: -1 } }, { new: true });

    return successResponse(res, 200, "Product quantity increased", cart);
  } catch (err) {
    return errorResponse(res, 500, "Error increasing product quantity", err instanceof Error ? err.message : err);
  }
};

export const decreaseQuantity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user?.id;

    if (!user) return errorResponse(res, 400, "User ID is required");

    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Product ID is required");

    const cart = await Cart.findOne({ user }).populate("items.product");
    if (!cart || cart.items.length === 0) return errorResponse(res, 404, "Cart not found or empty");

    const itemIndex = cart.items.findIndex((item: any) => item.product._id.toString() === id);
    if (itemIndex === -1) return errorResponse(res, 404, "Item not found in cart");

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

    await Product.findByIdAndUpdate(id, { $inc: { stock: 1 } }, { new: true });

    return successResponse(res, 200, "Product quantity decreased", cart);
  } catch (err) {
    return errorResponse(res, 500, "Error decreasing product quantity", err instanceof Error ? err.message : err);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user?.id;
    if (!user) return errorResponse(res, 400, "User ID is required");

    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Product ID is required");

    const cart = await Cart.findOne({ user }).populate("items.product");
    if (!cart || cart.items.length === 0) return errorResponse(res, 404, "Cart not found or empty");

    // hier wird any verwendet weil ts nicht weiss das wir das object populaten
    const itemIndex = cart.items.findIndex((item: any) => item.product._id.toString() === id);
    if (itemIndex === -1) return errorResponse(res, 404, "Item not found in cart");

    cart.items.splice(itemIndex, 1);
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + item.quantity * item.priceAtAddition;
    }, 0);
    cart.totalPrice = parseFloat(cart.totalPrice.toFixed(2));
    await cart.save();

    const removedItem = cart.items[itemIndex];
    cart.items.splice(itemIndex, 1);

    await Product.findByIdAndUpdate(id, { $inc: { stock: removedItem?.quantity } }, { new: true });

    return successResponse(res, 200, "Item removed from cart", cart);
  } catch (err) {
    return errorResponse(res, 500, "Error removing item from cart", err instanceof Error ? err.message : err);
  }
};

export const clearCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user?.id;
    if (!user) return errorResponse(res, 400, "User ID is required");

    const cart = await Cart.findOne({ user });
    if (!cart) return errorResponse(res, 404, "Cart not found");

    // das ist die effizienteste Methode, um den Lagerbestand zu aktualisieren
    await Product.bulkWrite(
      cart.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { stock: item.quantity } },
        },
      }))
    );

    cart.items.splice(0, cart.items.length);
    cart.totalPrice = 0;
    await cart.save();
    return successResponse(res, 200, "Cart cleared", cart);
  } catch (err) {
    return errorResponse(res, 500, "Error clearing cart", err instanceof Error ? err.message : err);
  }
};
