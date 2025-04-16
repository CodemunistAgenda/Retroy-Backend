import Product, { type ProductDocument } from "../models/product.model";
import { type Request, type Response } from "express";
import { errorResponse, successResponse } from "../utils/helper.function";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: ["user", "admin", "seller", "moderator"];
    verified?: boolean;
  };
}

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products: ProductDocument[] = await Product.find();

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
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product: ProductDocument = req.body;
    const salesperson = req.user?.id;

    const verified = req.user?.verified;

    if (verified === false) errorResponse(res, 403, "Please verify your account before creating a product.");

    const newProduct = new Product({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      color: product.color,
      category: product.category,
      weight: product.weight,
      dimensions: product.dimensions,
      specialDelivery: product.specialDelivery,
      images: product.images,
      mainCategory: product.mainCategory,
      collectionName: product.collectionName,
      subCollectionName: product.subCollectionName,
      salesperson: salesperson,
      isPublished: product.isPublished,
    });

    const existingProduct = await Product.findOne({ title: product.title });

    if (existingProduct) errorResponse(res, 400, "Product with this title already exists.");

    const savedProduct = await newProduct.save();
    if (!savedProduct) return errorResponse(res, 500, "Can't save product, creation failed.");

    return successResponse(res, 201, "Product created", savedProduct);
  } catch (error) {
    return errorResponse(res, 500, "Internal Error, could not create the product", error);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const product: ProductDocument | null = await Product.findById(id);

    if (!product) return errorResponse(res, 404, "Product not found.");

    return successResponse(res, 200, "Product found", product);
  } catch (err) {
    return errorResponse(res, 500, "Internal Error, could not get the product", err);
  }
};
// um die Produkte zu aktualisieren, muss der Salesperson die ID des Produkts haben

/**
 * @Bug um demensions zu updaten müssen alle werte angegeben werden
 */
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const exsitingProduct = await Product.findById(id);
    const product: ProductDocument = req.body;

    console.log("exsitingProduct", exsitingProduct);

    if (exsitingProduct?.salesperson.toString() !== req.user?.id) {
      return errorResponse(res, 403, "Permission denied, you are not the owner of this product.");
    }

    const newP = await Product.findByIdAndUpdate(id, product, { new: true });

    return successResponse(res, 200, "Product updated", newP);
  } catch (err) {
    return errorResponse(res, 500, "Internal Error, could not update the product", err);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const user = req.user?.id;
    const reason = req.body.reason;

    const product: ProductDocument | null = await Product.findById(id);

    if (!product) return errorResponse(res, 404, "Product not found.");

    if (product?.salesperson.toString() !== user) {
      return errorResponse(res, 403, "Permission denied, you are not the owner of this product.");
    }

    if (product.deleted.isDeleted) return errorResponse(res, 400, "Product already deleted.");

    product.deleted = {
      isDeleted: true,
      deletedAt: new Date(),
      reason: reason || "No reason provided",
      deletedBy: user,
    };

    await product.save();

    return successResponse(res, 200, "Product deleted", product);
  } catch (err) {
    return errorResponse(res, 500, "Internal Error, could not delete the product", err);
  }
};
