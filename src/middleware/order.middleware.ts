import { type Request, type Response, type NextFunction } from "express";
import { Types, type ObjectId } from "mongoose";
import Payment from "../models/payment.model.ts";
import { onlyLetters, numbersOnly, letterAndPunctuation } from "../utils/regex.ts";
import Cart from "../models/cart.model.ts";
import Address from "../models/address.model.ts";
import { errorResponse } from "../utils/helper.function.ts";
import { type ProductDocument } from "../models/product.model.ts";

interface Cart {
  userId: string;
  items: [
    {
      product: ProductDocument | Types.ObjectId;
      quantity: number;
      priceAtAddition: number;
    }
  ];
  totalPrice: number;
  totalWeight: number;
  totalVolume: number;
  totalVolumeWeight: number;
}

interface productItem {
  product: ProductDocument;
  quantity: number;
  priceAtAddition: number;
}

interface OrderAddress {
  street: string;
  city: string;
  zipCode: string;
  houseNumber: string;
}

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

interface orderSurcharges {
  type: string;
  count: number;
  price: number;
}

export const validateProductsForOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userCart = await Cart.findOne({ user: new Types.ObjectId(userId) }).populate("items.product");

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

      if (product.stock < item.quantity) {
        invalidProducts.push({
          reason: "Not enough stock",
          product: (product as ProductDocument)._id,
          availableStock: product.stock,
          requestedQuantity: item.quantity,
        });
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

      return errorResponse(res, 400, "Fehler: Produkte sind nicht verfügbar", invalidProducts);
    }

    req.body.cart = userCart;
    console.log("succesfully validated products");
    next();
  } catch (error) {
    res.status(500).json({ message: "Fehler bei der Validierung der Produkte.", error });
  }
};

export const getAndValidateAdress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    let { shippingAddress, billingAddress } = req.body;

    const resolveAddressIfNeeded = async (address: any) => {
      if (address instanceof Types.ObjectId || typeof address === "string") {
        return await Address.findById(address);
      }
      return address;
    };
    if (!shippingAddress || !billingAddress) {
      const payment = await Payment.findOne({ userId: new Types.ObjectId(userId) })
        .populate("shippingAddress")
        .populate("billingAddress");

      // hier ist die Frage ob die Adresse weitergeleitet wird wenn nur reference gespeichert ist

      if (payment) {
        shippingAddress = shippingAddress || (await resolveAddressIfNeeded(payment?.shippingAddress));
        billingAddress = billingAddress || (await resolveAddressIfNeeded(payment?.billingAddress));
      }

      if (!shippingAddress.city || !billingAddress.city) {
        const privat = await Address.findOne({ userId: new Types.ObjectId(userId) });

        if (privat) {
          console.log("we have a privat address");
          shippingAddress = shippingAddress || (await resolveAddressIfNeeded(privat));
          billingAddress = billingAddress || (await resolveAddressIfNeeded(privat));
        }
        if (!shippingAddress || !billingAddress) return errorResponse(res, 400, "Fehler: keine Adresse gefunden");
      }
    }

    const valitateAddress = (address: OrderAddress) => {
      let errors = [];

      if (!address) {
        errors.push("address is required");
      }
      const valString = (str: string, min: number, max: number, regex: RegExp) => {
        if (typeof str !== "string" || str.length < min || str.length > max || !regex.test(str)) {
          errors.push(`Invalid string: ${str}`);
        }
      };

      valString(address.street, 3, 50, onlyLetters);
      valString(address.city, 3, 20, onlyLetters);
      valString(address.zipCode, 4, 5, numbersOnly);
      valString(address.houseNumber, 1, 4, numbersOnly);

      if (errors.length > 0) {
        return errors;
      }

      // notwendigkeit muss noch geprüft werden
      // address.street = escape(address.street);
      // address.city = escape(address.city);
      // address.zipCode = escape(address.zipCode);
      // address.houseNumber = escape(address.houseNumber);

      return null;
    };
    const shippingAddressErrors = valitateAddress(shippingAddress);
    const billingAddressErrors = valitateAddress(billingAddress);

    if (shippingAddressErrors) {
      errorResponse(res, 400, "Fehlerhafte Lieferadresse", shippingAddressErrors);
      return;
    }
    if (billingAddressErrors) {
      errorResponse(res, 400, "Fehlerhafte Rechnungsadresse", billingAddressErrors);
      return;
    }

    const cleanAddress = (address: any) => {
      const { _id, userId, __v, ...cleaned } = address.toObject ? address.toObject() : address;
      return cleaned;
    };

    shippingAddress = cleanAddress(shippingAddress);
    billingAddress = cleanAddress(billingAddress);

    req.body.shippingAddress = shippingAddress;
    req.body.billingAddress = billingAddress;

    next();
  } catch (err) {
    res.status(500).json({
      message: "Fehler beim Abrufen der Adressen.",
      error: err,
    });
  }
};

export const calculatePrices = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { cart } = req.body;
  // console.log("cart", cart);
  // produkte müssen nicht valiert werden, da es in der middleware validatedProductsforOrder gemacht wird
  try {
    const products: productItem[] = cart.items;
    const total = products.reduce((acc: number, item: productItem) => {
      if (!item.product.price || typeof item.product.price !== "number") {
        console.log("if wurde erreicht");
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

    next();
  } catch (err) {
    errorResponse(res, 500, "error beim berechnen der preise", err);
  }
};

export const calculateShippingCost = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { items } = req.body.cart;
  const shippingMethod = req.body.shippingMethod || "standard";

  // produkte müssen nicht valiert werden, da es in der middleware validatedProductsforOrder gemacht wird
  const deliverySurcharges = {
    fragile: 0.05,
    oversize: 0.1,
    danger: 0.15,
  };
  try {
    // industrie standard:
    // volumeweight = (width * height * depth) / 5000
    // Danach wird vergleichen: Math.max(volumeweight, productweight)

    const productweight =
      items.reduce((acc: number, item: productItem) => {
        if (!item.product.weight || typeof item.product.weight === undefined) {
          return errorResponse(res, 400, "Error calculating shipping cost", "weight is missing");
        }
        return acc + item.product.weight * item.quantity;
      }, 0) / 1000; // in kg

    const volumeweight = Math.trunc(
      items.reduce((acc: number, item: productItem) => {
        if (!item.product.dimensions || typeof item.product.dimensions === undefined) {
          return errorResponse(res, 400, "Error calculating shipping cost", "Cant read dimensions");
        }
        const { depth, width, height } = item.product.dimensions;
        const volume = (depth * width * height) / 5000;
        return acc + volume * item.quantity;
      }, 0) / 1000
    ); // in kg

    const acctualWeight = Math.max(productweight, volumeweight);
    let shippingCost: number = 0;
    if (acctualWeight < 2) {
      shippingCost = 2.99;
    } else if (acctualWeight < 5) {
      shippingCost = 4.99;
    } else if (acctualWeight < 10) {
      shippingCost = 6.49;
    } else if (acctualWeight < 20) {
      shippingCost = 10.49;
    } else if (acctualWeight < 20) {
      shippingCost = 18.99;
    } else if (acctualWeight < 31.5) {
      shippingCost = 24.99;
    } else if (acctualWeight > 31.5) {
      shippingCost = 49.99;
    }

    // um die sonderzulagen an zuzeigen erstellen wir noch eine variable

    let specialsTotal = 0;
    if (shippingMethod === "express") {
      shippingCost += 6.99;
      specialsTotal += 6.99;
    } else if (shippingMethod === "overnight") {
      shippingCost += 12.99;
      specialsTotal += 12.99;
    }

    const surcharges: orderSurcharges[] = [];

    // wir müssen nicht nochmal fetchen da wir die Produkte im Body haben
    items.forEach((item: productItem) => {
      if (item.product.specialDelivery && item.product.specialDelivery?.length > 0) {
        item.product.specialDelivery?.forEach((type: string) => {
          const isValid = ["fragile", "oversize", "danger"].includes(type);
          if (!isValid)
            return errorResponse(res, 400, "Error calculating shipping cost", "Invalid special delivery type");

          if (deliverySurcharges[type as keyof typeof deliverySurcharges]) {
            const price =
              item.product.price * item.quantity * deliverySurcharges[type as keyof typeof deliverySurcharges];
            const count = item.quantity;

            surcharges.push({
              type,
              count,
              price,
            });
          }
        });
      }
    });

    let finalsurcharges = surcharges.reduce((acc: number, item: { price: number }) => {
      return acc + item.price;
    }, 0);
    shippingCost = Math.trunc(shippingCost * 100) / 100; // auf 2 Nachkommastellen runden
    req.body.shippingCost = shippingCost;

    shippingCost += finalsurcharges;
    specialsTotal += finalsurcharges;

    req.body.specialTotal = specialsTotal;
    req.body.orderSpecials = surcharges;
    req.body.shippingCost = shippingCost;
    req.body.finalAmount = req.body.totalAmount + req.body.taxAmount + shippingCost;

    next();
  } catch (err) {
    errorResponse(res, 500, "Fehler beim berechnen der Versandkosten", err);
  }
};

export const validatePayment = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { paymentMethod, paymentRefference } = req.body;

  if (!paymentMethod || !paymentRefference)
    return errorResponse(res, 400, "Fehler: Zahlungsmethode oder Referenz fehlt");

  const validatedPaymentMethod = ["creditcard", "paypal", "bank_transfer", "cash_on_delivery"].includes(paymentMethod);

  if (!validatedPaymentMethod) return errorResponse(res, 400, "Fehler: Zahlungsmethode nicht verfügbar");

  if (paymentMethod !== "cash_on_delivery" && typeof paymentMethod === "string") {
    const validator = {
      creditcard: (ref: string) => /^pi_[a-zA-Z0-9]+$/.test(ref),
      paypal: (ref: string) => /^[A-Z0-9]{17}$/.test(ref),
      bank_transfer: (ref: string) => /^BANKTRANS_\d{8}_[A-Z0-9]{6}$/.test(ref),
    };

    if (paymentMethod in validator) {
      const isValid = validator[paymentMethod as keyof typeof validator]?.(paymentRefference);

      if (!isValid) return errorResponse(res, 400, "Fehler: Ungültige Zahlungsreferenz");
    }
  } else {
    if (paymentRefference !== "N/A" && paymentRefference !== null) {
      return errorResponse(res, 400, "No payment reference in cash on delivery");
    }
  }

  next();
};

export const valReason = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { reason } = req.body;

  if (reason) {
    if (typeof reason !== "string" || reason.length < 2 || reason.length > 500 || letterAndPunctuation.test(reason)) {
      return errorResponse(res, 400, "Fehler: Grund ist ungültig");
    }
  }

  next();
};
