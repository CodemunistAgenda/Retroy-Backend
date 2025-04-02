import { type Request, type Response, type NextFunction } from "express";
import Product from "../models/product.model.ts";
import { onlyLetters as names } from "../utils/regex";

export const validateProduct = (req: Request, res: Response, next: NextFunction): void => {
  let {
    title,
    description,
    price,
    stock,
    color,
    category,
    images,
    mainCategory,
    collectionName,
    subCollectionName,
    isPublished,
  } = req.body;

  if (!title || typeof title !== "string" || title.trim().length < 2) {
    /* const valid = names.test(title); // nicht notwendig, da diese Validierung schon in der Product Model Validierung ist
    if (!valid) { 
        res.status(400).json({ message: "Title has to be written in letters only" });
        return;
    } */
    res.status(400).json({ message: "Title has to be a string with at least 2 Characters" });
    return;
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    res.status(400).json({ message: "Description has to be a string with at least 10 Characters" });
    return;
  }

  if (!price || typeof price !== "number" || price <= 0) {
    price = Number(price.toFixed(2));
    res.status(400).json({ message: "Price has to be a number greater than 0" });
    return;
  }
  if (stock) {
    if (typeof stock !== "number" || stock < 0) {
      res.status(400).json({ message: "Stock has to be a number greater than or equal to 0" });
      return;
    }
  }

  if (!color || typeof color !== "string" || color.trim().length < 2) {
    const valid = names.test(color);
    valid
      ? res.status(400).json({ message: "Color has to be a valid color name (e.g., 'red', 'blue', etc.)" })
      : res.status(400).json({ message: "Color has to be a string with at least 2 Characters" });

    return;
  }
  // sollte nicht notwendig sein, die Category wird über ein Dropdown ausgewählt
  // möglicherweise sonstiges?
  if (!category || typeof category !== "string" || category.trim().length < 2) {
    const valid = names.test(category);
    valid
      ? res
          .status(400)
          .json({ message: "Category has to be a valid category name (e.g., 'electronics', 'clothing', etc.)" })
      : res.status(400).json({ message: "Category has to be a string with at least 2 Characters" });

    return;
  }

  if (!images || !Array.isArray(images) || images.length === 0 || images.some((img) => typeof img !== "string")) {
    res.status(400).json({ message: "you have to provide at least one image" });
    return;
  }

  if (!mainCategory || typeof mainCategory !== "string" || mainCategory.trim().length < 2) {
    const valid = names.test(mainCategory);
    valid
      ? res
          .status(400)
          .json({ message: "Main Category has to be a valid category name (e.g., 'electronics', 'clothing', etc.)" })
      : res.status(400).json({ message: "Main Category has to be a string with at least 2 Characters" });

    return;
  }

  if (!collectionName || typeof collectionName !== "string" || collectionName.trim().length < 2) {
    const valid = names.test(collectionName);
    valid
      ? res
          .status(400)
          .json({ message: "Collection Name has to be a valid category name (e.g., 'electronics', 'clothing', etc.)" })
      : res.status(400).json({ message: "Collection Name has to be a string with at least 2 Characters" });

    return;
  }

  if (!subCollectionName || typeof subCollectionName !== "string" || subCollectionName.trim().length < 2) {
    const valid = names.test(subCollectionName);
    valid
      ? res.status(400).json({
          message: "Sub Collection Name has to be a valid category name (e.g., 'electronics', 'clothing', etc.)",
        })
      : res.status(400).json({ message: "Sub Collection Name has to be a string with at least 2 Characters" });

    return;
  }
  // ich möchte eine checkbox dafür haben im Frontend
  if (isPublished !== undefined && typeof isPublished !== "boolean") {
    res.status(400).json({ message: "isPublished has to be a boolean" });
  }

  req.body.product = {
    title,
    description,
    price,
    stock,
    color,
    category,
    images,
    mainCategory,
    collectionName,
    subCollectionName,
    isPublished,
  };

  next();
};

export const findProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    req.body.product = product;
    next();
  } catch (err) {
    res.status(500).json({ message: "Error retrieving product", error: err });
    return;
  }
};

export const validateProductForUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const allowedFields = [
    "title",
    "description",
    "price",
    "stock",
    "color",
    "category",
    "images",
    "mainCategory",
    "collectionName",
    "subCollectionName",
    "isPublished",
  ];

  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every((field) => allowedFields.includes(field));

  if (!isValidUpdate) {
    res.status(400).json({ message: "Invalid field(s) provided for update." });
    return;
  }
  let {
    title,
    description,
    price,
    stock,
    color,
    category,
    images,
    mainCategory,
    collectionName,
    subCollectionName,
    isPublished,
  } = req.body;

  if (title !== undefined && (typeof title !== "string" || title.trim().length < 2)) {
    /* const valid = names.test(title); // nicht notwendig, da diese Validierung schon in der Product Model Validierung ist
      if (!valid) { 
          res.status(400).json({ message: "Title has to be written in letters only" });
          return;
      } */
    res.status(400).json({ message: "Title has to be a string with at least 2 Characters" });
    return;
  }

  if (description !== undefined && (typeof description !== "string" || description.trim().length < 10)) {
    res.status(400).json({ message: "Description has to be a string with at least 10 Characters" });
    return;
  }

  if (price !== undefined && (typeof price !== "number" || price <= 0)) {
    price = Number(price.toFixed(2));
    res.status(400).json({ message: "Price has to be a number greater than 0" });
    return;
  }
  if (stock !== undefined) {
    if (typeof stock !== "number" || stock < 0) {
      res.status(400).json({ message: "Stock has to be a number greater than or equal to 0" });
      return;
    }
  }

  if (color !== undefined && (typeof color !== "string" || color.trim().length < 2)) {
    const valid = names.test(color);
    valid
      ? res.status(400).json({ message: "Color has to be a valid color name (e.g., 'red', 'blue', etc.)" })
      : res.status(400).json({ message: "Color has to be a string with at least 2 Characters" });

    return;
  }
  // sollte nicht notwendig sein, die Category wird über ein Dropdown ausgewählt
  // möglicherweise sonstiges?
  if (category !== undefined && (typeof category !== "string" || category.trim().length < 2)) {
    const valid = names.test(category);
    valid
      ? res
          .status(400)
          .json({ message: "Category has to be a valid category name (e.g., 'electronics', 'clothing', etc.)" })
      : res.status(400).json({ message: "Category has to be a string with at least 2 Characters" });

    return;
  }

  if (
    images !== undefined &&
    (!Array.isArray(images) || images.length === 0 || images.some((img) => typeof img !== "string"))
  ) {
    res.status(400).json({ message: "you have to provide at least one image" });
    return;
  }

  if (mainCategory !== undefined && (typeof mainCategory !== "string" || mainCategory.trim().length < 2)) {
    const valid = names.test(mainCategory);
    valid
      ? res
          .status(400)
          .json({ message: "Main Category has to be a valid category name (e.g., 'electronics', 'clothing', etc.)" })
      : res.status(400).json({ message: "Main Category has to be a string with at least 2 Characters" });

    return;
  }

  if (collectionName !== undefined && (typeof collectionName !== "string" || collectionName.trim().length < 2)) {
    const valid = names.test(collectionName);
    valid
      ? res
          .status(400)
          .json({ message: "Collection Name has to be a valid category name (e.g., 'electronics', 'clothing', etc.)" })
      : res.status(400).json({ message: "Collection Name has to be a string with at least 2 Characters" });

    return;
  }

  if (
    subCollectionName !== undefined &&
    (typeof subCollectionName !== "string" || subCollectionName.trim().length < 2)
  ) {
    const valid = names.test(subCollectionName);
    valid
      ? res.status(400).json({
          message: "Sub Collection Name has to be a valid category name (e.g., 'electronics', 'clothing', etc.)",
        })
      : res.status(400).json({ message: "Sub Collection Name has to be a string with at least 2 Characters" });

    return;
  }
  // ich möchte eine checkbox dafür haben im Frontend
  if (isPublished !== undefined && typeof isPublished !== "boolean") {
    res.status(400).json({ message: "isPublished has to be a boolean" });
  }

  req.body.product = {
    title,
    description,
    price,
    stock,
    color,
    category,
    images,
    mainCategory,
    collectionName,
    subCollectionName,
    isPublished,
  };

  next();
};
