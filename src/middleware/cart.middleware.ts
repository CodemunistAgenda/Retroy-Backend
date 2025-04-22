import { type Request, type Response, type NextFunction } from "express";
import Cart, { type CartDocument } from "../models/cart.model";
import Product, { type ProductDocument } from "../models/product.model";
import { errorResponse } from "../utils/helper.function";
import { validateAddress } from "./address.validation";
import User, { type UserDocument } from "../models/user.model";
import { type AddressDocument } from "../models/address.model";
import type { Document } from "mongoose";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
  shippingPreview?: Array<{
    shippingMethod: string;
    weightKg: number;
    baseCost: number;
    totalCost: number;
    specials: number;
    surcharges: Array<{
      type: string;
      count: number;
      price: number;
    }>;
  }>;
}

interface productItem {
  product: {
    _id: string;
    title: string;
    price: number;
    weight: number;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    specialDelivery: string[];
    isPublished: boolean;
  };
  quantity: number;
}
interface orderSurcharges {
  type: string;
  count: number;
  price: number;
}

interface IAddress {
  houseNumber: string;
  street: string;
  zipCode: string;
  city: string;
}

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
export const validateProductsForCartPreview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  console.log("validate Products for Cart");
  try {
    const userId = req.user?.id;
    const userCart = await Cart.findOne({ user: userId }).populate("items.product");

    if (!userCart) return errorResponse(res, 404, "Warenkorb nicht gefunden");

    const invalidProducts: any[] = [];

    for (const item of userCart.items) {
      // Achtung: 'product' ist durch .populate() ein vollständiges Produkt-Dokument,
      // aber TypeScript erkennt das nicht zuverlässig, daher temporär 'any'
      const product = item.product as any;

      if (!product) {
        invalidProducts.push({
          product,
          reason: "Not available",
        });
        continue;
      }

      if (!product.isPublished) {
        invalidProducts.push({
          product: (product as ProductDocument).id,
          reason: "not available",
        });
      }

      if (product.deleted.isDeleted) {
        invalidProducts.push({
          product: (product as ProductDocument).id,
          reason: "not available",
        });
      }

      if (invalidProducts.length > 0) {
        return errorResponse(res, 400, "Fehler: Ungültige Produkte im Warenkorb", invalidProducts);
      }
    }

    req.body.cart = userCart;
    console.log("succesfully validated products");
    next();
  } catch (err) {
    return errorResponse(
      res,
      500,
      "Fehler beim Validieren der Produkte",
      err instanceof Error ? err.message : "Unknown error"
    );
  }
};

export const getAndValidateAdress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log("get and validate address");
  try {
    const userId = req.user?.id;

    const user = (await User.findById(userId)
      .populate({
        path: "shippingAddress",
        select: "houseNumber street zipCode city",
      })
      .populate({
        path: "billingAddress",
        select: "houseNumber street zipCode city",
      })
      .populate({
        path: "privateAddress",
        select: "houseNumber street zipCode city",
      })) as any;
    // wir casten hier auf any, da ts nicht versteht dass die populate funktionen immer ein address document zurückgeben

    let billingAddress = user?.billingAddress;
    let shippingAddress = user?.shippingAddress;
    let privateAddress = user?.privateAddress;

    const shippingAddressErrors = user?.shippingAddress ? validateAddress(user.shippingAddress) : null;
    const billingAddressErrors = user?.billingAddress ? validateAddress(user?.billingAddress) : null;
    const privateAddressErrors = user?.privateAddress ? validateAddress(user?.privateAddress) : null;

    if (shippingAddressErrors) {
      errorResponse(res, 400, "Fehlerhafte Lieferadresse", shippingAddressErrors);
      return;
    }
    if (billingAddressErrors) {
      errorResponse(res, 400, "Fehlerhafte Rechnungsadresse", billingAddressErrors);
      return;
    }
    if (privateAddressErrors) {
      errorResponse(res, 400, "Fehlerhafte PrivatAddresse", privateAddressErrors);
      return;
    }

    const cleanAddress = (address: any) => {
      const { _id, userId, __v, ...cleaned } = address.toObject ? address.toObject() : address;
      return cleaned;
    };

    shippingAddress = cleanAddress(shippingAddress);
    billingAddress = cleanAddress(billingAddress);
    privateAddress = cleanAddress(privateAddress);

    req.body.shippingAddress = shippingAddress;
    req.body.billingAddress = billingAddress;
    req.body.privateAddress = privateAddress;
    console.log("succesfully validated address");
    next();
  } catch (err) {
    errorResponse(res, 500, "Fehler beim Validieren der Adresse", err instanceof Error ? err.message : "Unknown error");
  }
};

export const calculatePrices = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { cart } = req.body;
  console.log("calculate prices");
  // produkte müssen nicht valiert werden, da es in der middleware validatedProductsforOrder gemacht wird
  try {
    const products: productItem[] = cart.items;
    const total = products.reduce((acc: number, item: productItem) => {
      console.log("item", item);
      if (!item.product.price || typeof item.product.price !== "number") {
        errorResponse(res, 400, "Error calculating prices", "price is missing");
        return acc; // Return the current accumulator value to avoid undefined
      }
      return acc + item.product.price * item.quantity;
    }, 0);
    if (total <= 0) {
      errorResponse(res, 400, "Fehler beim berechnen des Preisess");
    }

    const taxes = total * 0.19; // Beispiel: 19% Mehrwertsteuer

    req.body.totalAmount = total;
    req.body.taxAmount = taxes;
    console.log("finished calculating prices");
    next();
  } catch (err) {
    errorResponse(res, 500, "error beim berechnen der preise", err);
  }
};

export const generateShippingPreview = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { items } = req.body.cart;

  const deliverySurcharges = {
    fragile: 0.05,
    oversize: 0.1,
    danger: 0.15,
  };

  const shippingMethods = ["standard", "express", "overnight"];

  try {
    if (!items || !Array.isArray(items)) {
      return errorResponse(res, 400, "Fehlerhafte Cart-Daten", "items fehlt oder ist kein Array");
    }

    const productWeightKg = items.reduce((acc: number, item: productItem) => {
      if (!item.product.weight) {
        throw new Error("Produktgewicht fehlt");
      }
      return acc + (item.product.weight * item.quantity) / 1000;
    }, 0);

    const volumeWeightKg = items.reduce((acc: number, item: productItem) => {
      const dims = item.product.dimensions;
      if (!dims) throw new Error("Produktdimensionen fehlen");
      const { width, height, depth } = dims;
      const volumeWeight = ((width * height * depth) / 5000) * item.quantity;
      return acc + volumeWeight / 1000;
    }, 0);

    const actualWeight = Math.max(productWeightKg, volumeWeightKg);

    const baseShipping = (): number => {
      if (actualWeight < 2) return 2.99;
      if (actualWeight < 5) return 4.99;
      if (actualWeight < 10) return 6.49;
      if (actualWeight < 20) return 10.49;
      if (actualWeight < 31.5) return 24.99;
      return 49.99;
    };

    const previewResults = shippingMethods.map((method) => {
      let shippingCost = baseShipping();
      let specialsTotal = 0;

      const surcharges: orderSurcharges[] = [];

      // Express und Overnight Zuschläge
      if (method === "express") {
        shippingCost += 6.99;
        specialsTotal += 6.99;
      } else if (method === "overnight") {
        shippingCost += 12.99;
        specialsTotal += 12.99;
      }

      // Besondere Lieferbedingungen
      items.forEach((item: productItem) => {
        const deliveryTypes = item.product.specialDelivery || [];

        deliveryTypes.forEach((type: string) => {
          if (!deliverySurcharges[type as keyof typeof deliverySurcharges]) {
            throw new Error(`Ungültiger Liefertyp: ${type}`);
          }

          const surcharge =
            item.product.price * item.quantity * deliverySurcharges[type as keyof typeof deliverySurcharges];
          surcharges.push({
            type,
            count: item.quantity,
            price: Math.round(surcharge * 100) / 100,
          });
        });
      });

      const finalSurcharges = surcharges.reduce((acc, s) => acc + s.price, 0);
      shippingCost += finalSurcharges;
      specialsTotal += finalSurcharges;

      return {
        shippingMethod: method,
        weightKg: Math.round(actualWeight * 100) / 100,
        baseCost: Math.round(baseShipping() * 100) / 100,
        totalCost: Math.round(shippingCost * 100) / 100,
        specials: Math.round(specialsTotal * 100) / 100,
        surcharges,
      };
    });

    // Vorschau dem Request hinzufügen
    req.shippingPreview = previewResults;

    next();
  } catch (err: any) {
    return errorResponse(res, 500, "Fehler beim Berechnen der Versand-Vorschau", err.message || err);
  }
};
