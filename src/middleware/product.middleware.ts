import { type Request, type Response, type NextFunction } from "express";
import Product from "../models/product.model.ts";
import { onlyLetters as names, letterAndPunctuation } from "../utils/regex.ts";

const validateFields = (data: any, isUpdate = false) => {
  let errors: string[] = [];

  const valString = (field: string, minLen: number, maxLen: number) => {
    if (isUpdate && data[field] === undefined) return;
    if (
      !data[field] ||
      typeof data[field] !== "string" ||
      data[field].trim().length < minLen ||
      data[field].trim().length > maxLen ||
      !names.test(data[field])
    ) {
      console.log("data from validator: ", data);
      console.log("data zum verarbeiten: ", field, " : ", data[field]);
      console.log("datatyp: ", typeof data[field]);
      console.log("length: ", data[field].trim().length, "range: ", minLen, " - ", maxLen);
      console.log("test: ", names.test(data[field]));
      console.log("field: ", field, " ist nicht ok");
      errors.push(`${field} must be a valid string of Characters with a length of at least 2 chars`);
    }
  };

  const valDesc = (field: string, minLen: number, maxLen: number) => {
    if (isUpdate && data[field] === undefined) return;
    if (
      !data[field] ||
      typeof data[field] !== "string" ||
      data[field].trim().length < minLen ||
      data[field].trim().length > maxLen ||
      !letterAndPunctuation.test(data[field])
    ) {
      errors.push(`${field} must be a valid string of Characters with a length of at least 2 chars`);
    }
  };

  const valNum = (field: string, minVal: number, maxVal: number) => {
    if (isUpdate && data[field] === undefined) return;
    if (
      data[field] !== undefined &&
      (typeof data[field] !== "number" || (data[field] < minVal && data[field] > maxVal))
    ) {
      errors.push(`${field} has to be a number with a minimum value of ${minVal}`);
    }
  };

  const valArr = (field: string) => {
    if (isUpdate && data[field] === undefined) return;
    if (
      !Array.isArray(data[field] || data[field].length < 1) ||
      data[field].some((item: any) => typeof item !== "string")
    ) {
      errors.push(`${field} has to be an array of strings`);
    }
  };
  const valDimensions = (field: string, min: number, max: number) => {
    if (isUpdate && data[field] === undefined) return;

    ["width", "height", "depth"].forEach((dim) => {
      const val = data[field][dim];
      if (val === undefined || typeof val !== "number" || val < min || val > max) {
        errors.push(`${field}.${dim} has to be a number with a minimum value of ${min} and max of ${max}`);
      }
    });
  };
  const valSpecialDelivery = (field: string) => {
    if (data[field] === undefined) return;
    console.log("specialDelivery: ", data[field]);
    if (
      !Array.isArray(data[field]) ||
      data[field].some((item: any) => typeof item !== "string" || !["oversize", "fragile", "danger"].includes(item))
    ) {
      errors.push(`${field} has to be an array of strings with values: oversize, fragile, danger`);
    }
  };

  valString("title", 2, 50);
  valDesc("description", 2, 500);
  valNum("price", 0, 100000);
  valArr("images");
  valNum("weight", 0, 100000);
  valDimensions("dimensions", 0, 10000);
  valNum("stock", 1, 10000);
  valSpecialDelivery("specialDelivery");
  valString("color", 2, 20);
  valString("category", 2, 20);
  valString("mainCategory", 2, 20);
  valString("collectionName", 2, 20);
  valString("subCollectionName", 2, 20);

  if (data.isPublished !== undefined && typeof data.isPublished !== "boolean") {
    errors.push("isPublished has to be a boolean");
  }

  return errors;
};

export const validateProduct = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validateFields(req.body);

  if (errors.length > 0) {
    res.status(400).json({ message: errors.join(", ") });
    return;
  }

  next();
};

export const validateProductForUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validateFields(req.body, true);

  if (errors.length > 0) {
    res.status(400).json({ message: errors.join(", ") });
    return;
  }

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
