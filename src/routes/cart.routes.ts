import { Router } from "express";
import {
  addToCart,
  getUserCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  preview,
} from "../controllers/cart.controller";
import {
  validateProductsForCartPreview,
  getAndValidateAdress,
  calculatePrices,
  generateShippingPreview,
} from "../middleware/cart.middleware";

const router = Router();

router
  // anzeige was im Warenkorb ist
  .get("/", getUserCart)
  // ausrechnen aller Preise und Vorschau vor dem Checkout
  .get(
    "/preview",
    // sicherstellen das alle Produkte gültig sind
    validateProductsForCartPreview,
    // beschaffen der Addressdaten, und prüfen aufgültigkeit
    getAndValidateAdress,
    // ausrechnen der Versandkosten
    generateShippingPreview,
    // finales ausrechnen aller möglichen Preise bei unterschiedlichen versandarten
    calculatePrices,
    preview
  )
  // 1 Produkt adden
  .post("/add", addToCart)
  .patch("/:id/increase", increaseQuantity)
  .patch("/:id/decrease", decreaseQuantity)

  // 1 Produkt entfernen
  .delete("/:id/remove", removeFromCart)
  // alle Produkte entfernen
  .delete("/clear", clearCart);

export default router;
