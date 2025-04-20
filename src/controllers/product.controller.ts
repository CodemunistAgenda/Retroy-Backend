import Product, { type ProductDocument } from "../models/product.model";
import { type Request, type Response } from "express";
import { errorResponse, successResponse } from "../utils/helper.function";

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    let products: ProductDocument[] = await Product.find();

    products = products.filter((product) => !product.deleted.isDeleted);

    if (!products || products.length === 0) errorResponse(res, 404, "No products found.");

    return successResponse(res, 200, "Produkte:", products);
  } catch (err) {
    return successResponse(res, 500, "Fehler beim Laden der Produkte.", err);
  }
};

/**
 *
 * @warning This Route must be protected, in Production everyone can create a product
 */
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product } = req.body;

    if (!product) return errorResponse(res, 404, "Middleware failed no Product exist.");

    return successResponse(res, 200, "Product found", product);
  } catch (err) {
    return errorResponse(res, 500, "Internal Error, could not get the product", err);
  }
};
