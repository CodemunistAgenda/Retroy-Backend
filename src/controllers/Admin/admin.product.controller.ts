import { type Request, type Response } from "express";
import { Types } from "mongoose";

import Product, { type ProductDocument, type ProductType } from "../../models/product.model";
import { errorResponse, successResponse } from "../../utils/helper.function";
import { sendInformationsEmail } from "../../middleware/sendingMails";
import type { UserDocument, UserType } from "../../models/user.model";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: ["user", "admin", "seller", "moderator"];
    verified?: boolean;
  };
}

export const getProductsOfUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const products: ProductDocument[] = await Product.find({ salesperson: new Types.ObjectId(id) });

    if (!products || products.length === 0) {
      return errorResponse(res, 404, "No products found for this user.");
    }

    return successResponse(res, 200, "Products of user:", products);
  } catch (err) {
    return errorResponse(res, 500, "Error while getting products of user", err);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { userDetails, userDetailsAll } = req.query;
    let query = Product.findById(id);

    if (userDetails) {
      query = query.populate("salesperson", "username email");
    }

    if (userDetailsAll) {
      query = query.populate("salesperson");
    }

    const product: ProductType | null = (await query.exec()) as ProductType | null;
    if (!product) return errorResponse(res, 404, "Product not found.");

    return successResponse(res, 200, "Product:", product);
  } catch (err) {
    return errorResponse(res, 500, "Error while getting product by id", err);
  }
};

export const updateUserProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const productData: ProductDocument = req.body;

    const dbProduct: ProductDocument | null = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });
    if (!dbProduct) return errorResponse(res, 404, "Product not found.");

    let popProduct = await dbProduct.populate<{ salesperson: UserType }>("salesperson", "username email");

    let user: UserType | null = popProduct.salesperson;

    if (!user) {
      errorResponse(res, 404, "User not found.");
      return;
    }

    if (!user) return errorResponse(res, 404, "User not found.");

    console.log(user);

    let text = `
      <h2>Dear ${user.username},</h2>
      <p>We have updated your product with the following details:</p>
      <ul>
        <li><strong>Title:</strong> ${dbProduct.title}</li>
        <li><strong>Description:</strong> ${dbProduct.description}</li>
        <li><strong>Price:</strong> ${dbProduct.price}</li>
        <li><strong>Stock:</strong> ${dbProduct.stock}</li>
        <li><strong>Color:</strong> ${dbProduct.color}</li>
        <li><strong>Category:</strong> ${dbProduct.category}</li>
        <li><strong>Weight:</strong> ${dbProduct.weight}</li>
        <li><strong>Dimensions:</strong> ${dbProduct.dimensions.width} x ${dbProduct.dimensions.height} x ${
      dbProduct.dimensions.depth
    }</li>
        <li><strong>Main Category:</strong> ${dbProduct.mainCategory}</li>
        <li><strong>Collection Name:</strong> ${dbProduct.collectionName}</li>
        <li><strong>Special Delivery:</strong> ${dbProduct.specialDelivery.join(", ")}</li>
        <li><strong>Sub Collection Name:</strong> ${dbProduct.subCollectionName}</li>
        <li><strong>Is Published:</strong> ${dbProduct.isPublished}</li>
      </ul>

      <p>If you have any questions, feel free to contact us: <a href="mailto:norman.tetzlaff@gmail.com">Costumer Support </a></p>
      <p>Best regards,</p>
      <p>Retroy Customer Support</p>
    `;

    if (process.env.VERIFYING === "true") {
      sendInformationsEmail(user.email, "Information from Retroy Costumer Support", text);
    }
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
      salesperson,
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
    if (salesperson && typeof salesperson === "string") {
      filter.salesperson = new Types.ObjectId(salesperson);
    }

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

export const deleteUserProduct = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const popProduct = await targetProduct.populate<{ salesperson: UserDocument }>("salesperson", "username email");

    const user: UserDocument | null = popProduct.salesperson;
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    targetProduct.deleted = {
      isDeleted: true,
      deletedAt: new Date(),
      reason: reason || "no reason provided",
      deletedBy: req.user!.id,
    };

    targetProduct.save();

    let text = `
      <h2>Dear ${user.username},</h2>
      <p>We regret to inform you that your product named: ${targetProduct.title}, has been deleted</p>
      <p>Reason: ${reason || "No reason provided"}</p>
      <p>if you have any Questions feel free to contact us: <a href="mailto:norman.tetzlaff@gmail.com">Customer Support</a></p>
      <br>

      <p>Best regards,</p>
      <p>Retroy Customer Support</p>
    `;
    if (process.env.VERIFYING === "true") {
      sendInformationsEmail(user.email, "Information from Retroy Costumer Support", text);
    }
    console.log("targetProduct", targetProduct);
    console.log("text", text);

    return successResponse(res, 200, "Product deleted successfully.", targetProduct);
  } catch (err) {
    return errorResponse(res, 500, "Error while deleting product", err);
  }
};
