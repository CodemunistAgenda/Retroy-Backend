import { type Request, type Response } from "express";

import Product, { type ProductDocument, type ProductType } from "../../models/product.model";
import { errorResponse, successResponse } from "../../utils/helper.function";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: ["user", "admin", "seller", "moderator"];
    verified?: boolean;
  };

  files?: {
    images?: Express.Multer.File[];
  };
}

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log("i am in create product");
    const product: ProductDocument = req.body;

    const verified = req.user?.verified;

    if (verified === false) return errorResponse(res, 403, "Please verify your account before creating a product.");

    const images = (req.files?.images as Express.Multer.File[]).map((file) => file.path);

    console.log("images", images);
    const newProduct = new Product({
      ...product,
      images: images,
    });

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
    const product: ProductType | null = (await Product.findById(id)) as ProductType | null;
    if (!product) return errorResponse(res, 404, "Product not found.");

    return successResponse(res, 200, "Product:", product);
  } catch (err) {
    return errorResponse(res, 500, "Error while getting product by id", err);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productData: ProductDocument = req.body;

    const dbProduct: ProductDocument | null = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });
    if (!dbProduct) return errorResponse(res, 404, "Product not found.");

    return successResponse(res, 200, "Product updated successfully.", dbProduct);
  } catch (err) {
    return errorResponse(res, 500, "Error while updating product", err);
  }
};

/**
 * @info das hier ist die Filter funktion
 */

export const filterProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      minPrice,
      maxPrice,
      color,
      category,
      mainCategory,
      isPublished,
      deleted,
      spezialDelivery,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    const filter: any = {};

    if (title) filter.title = { $regex: title, $options: "i" }; // case insensitive

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (color) filter.color = color;
    if (category) filter.category = category;
    if (mainCategory) filter.mainCategory = mainCategory;
    if (isPublished) filter.isPublished = isPublished === "true";

    if (deleted !== undefined) {
      filter["deleted.isDeleted"] = deleted === "true";
    }

    if (spezialDelivery && typeof spezialDelivery === "string") {
      filter.specialDelivery = { $in: spezialDelivery.split(",") };
    }
    const sortOptions: any = {};

    sortOptions[sortBy as string] = sortOrder === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    return successResponse(res, 200, "Filtered products:", products);
  } catch (err) {
    return errorResponse(res, 500, "Error while filtering products", err);
  }
};

/**
 *
 * @info delete function für admins setzen die Admin id ein
 */

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const targetProduct: ProductDocument | null = await Product.findById(id);

    if (!targetProduct) {
      return errorResponse(res, 404, "Product not found.");
    }

    if (targetProduct.deleted.isDeleted) {
      return errorResponse(res, 400, "Product already deleted.");
    }

    targetProduct.deleted = {
      isDeleted: true,
      deletedAt: new Date(),
      reason: reason || "no reason provided",
      deletedBy: req.user!.id,
    };

    targetProduct.save();

    return successResponse(res, 200, "Product deleted successfully.", targetProduct);
  } catch (err) {
    return errorResponse(res, 500, "Error while deleting product", err);
  }
};

export const restoreProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const targetProduct: ProductDocument | null = await Product.findById(id);

    if (!targetProduct) {
      return errorResponse(res, 404, "Product not found.");
    }

    if (!targetProduct.deleted.isDeleted) {
      return errorResponse(res, 400, "Product is not deleted.");
    }

    targetProduct.deleted = {
      isDeleted: false,
      deletedAt: null,
      reason: null,
      deletedBy: null,
    };
    targetProduct.save();

    return successResponse(res, 200, "Product restored successfully.", targetProduct);
  } catch (err) {
    return errorResponse(res, 500, "Error while restoring product", err);
  }
};
