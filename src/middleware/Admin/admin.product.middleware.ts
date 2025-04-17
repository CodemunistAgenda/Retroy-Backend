import { type Request, type Response, type NextFunction } from "express";
import { errorResponse } from "../../utils/helper.function";
import { letterAndPunctuation } from "../../utils/regex";

export function sanitizeQuery(req: Request, res: Response, next: NextFunction): void {
  const allowed = [
    "title",
    "minPrice",
    "maxPrice",
    "color",
    "category",
    "mainCategory",
    "isPublished",
    "salesperson",
    "deleted",
    "spezialDelivery",
    "sortBy",
    "sortOrder",
    "page",
    "limit",
  ];

  for (const key in req.query) {
    if (!allowed.includes(key)) errorResponse(res, 400, `Invalid query parameter: ${key}`);
  }

  // typekonvertierung:

  const validNumber = (val: string, max: number): void => {
    const num = Number(val);
    if (isNaN(num) || !isFinite(num) || num < 0 || num > max) {
      errorResponse(res, 400, `Invalid value for ${val} - must be number between 0 and ${max}`);
    }
  };

  const validString = (val: string): void => {
    if (typeof val !== "string" || val.trim() === "") {
      errorResponse(res, 400, `Invalid value for ${val} - must be a non-empty string`);
    }
  };

  const validBoolean = (val: string): void => {
    if (val !== "true" && val !== "false") {
      errorResponse(res, 400, `Invalid value for ${val} - must be a boolean`);
    }
  };
  const validObjectId = (val: string): void => {
    if (!/^[0-9a-fA-F]{24}$/.test(val)) {
      errorResponse(res, 400, `Invalid value for ${val} - must be a valid ObjectId`);
    }
  };
  const validArray = (val: string): void => {
    if (!Array.isArray(val)) {
      errorResponse(res, 400, `Invalid value for ${val} - must be an array`);
    }
  };

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
    sortBy,
    sortOrder,
    page,
    limit,
  } = req.query;

  if (title) validString(title as string);
  if (minPrice) validNumber(minPrice as string, 100000);
  if (maxPrice) validNumber(maxPrice as string, 100000);
  if (color) validString(color as string);
  if (category) validString(category as string);
  if (mainCategory) validString(mainCategory as string);
  if (isPublished) validBoolean(isPublished as string);
  if (salesperson) validObjectId(salesperson as string);
  if (deleted) validBoolean(deleted as string);
  if (spezialDelivery) {
    const deliveryValues = Array.isArray(spezialDelivery) ? spezialDelivery : [spezialDelivery];

    for (const item of deliveryValues) {
      validString(item as string);
    }
  }
  if (sortBy) validString(sortBy as string);
  if (sortOrder && sortOrder !== "asc" && sortOrder !== "desc") {
    errorResponse(res, 400, `Invalid value for sortOrder - must be 'asc' or 'desc'`);
  }
  if (page) validNumber(page as string, 1000);
  if (limit) validNumber(limit as string, 100);

  next();
}

export const checkReason = (req: Request, res: Response, next: NextFunction): void => {
  const { reason } = req.body;

  if (reason && typeof reason !== "string" && reason.trim() === "" && reason.length <= 10 && reason.length >= 100) {
    return errorResponse(res, 400, "Reason must be a non-empty string with a length between 10 and 100 characters");
  }

  if (!letterAndPunctuation.test(reason)) {
    return errorResponse(res, 400, "Reason contains invalid characters");
  }

  next();
};
