import { errorResponse } from "../../utils/helper.function";
import { onlyLetters as letters, telNumber, email, numbersOnly } from "../../utils/regex";
import { type Response, type Request, type NextFunction } from "express";

const validateFields = (data: any): string[] => {
  let errors: string[] = [];

  const valString = (field: string, minlen: number, maxlen: number, regex: RegExp) => {
    // ist nur zum updatenen deshalb müssen nicht alle definiert sein
    if (data[field] === undefined) return;

    const val = data[field];
    if (
      !val ||
      typeof val !== "string" ||
      val.trim().length < minlen ||
      val.trim().length > maxlen ||
      !regex.test(val)
    ) {
      errors.push(`${field} must be a valid string of Characters with a length of at least ${minlen} chars`);
    }
  };

  const valBoolean = (field: string) => {
    if (data[field] === undefined) return;
    const val = data[field];
    if (typeof val !== "boolean") {
      errors.push(`${field} must be a valid boolean`);
    }
  };

  const valObj = (field: string) => {
    if (data[field] === undefined) return;

    const val = data[field];
    if (typeof val !== "object" || Array.isArray(val) || val === null) {
      errors.push(`${field} must be a valid object`);
    }
  };

  const valArr = (field: string) => {
    if (data[field] === undefined) return;

    const val = data[field];
    if (!Array.isArray(val)) {
      errors.push(`${field} must be a valid array`);
    }
  };

  const parts = ["userData", "personalData", "payment", "address", "orders", "favorites", "cart"];

  parts.forEach((part) => {
    if (data[part] === undefined) return;
    switch (part) {
      case "userData":
        valString("username", 3, 25, letters);
        valString("email", 7, 50, email);
        valBoolean("verified");
        break;

      case "orders":
        console.log("orders");
        console.log(data[part]);
        valArr("orders");
        break;

      case "favorites":
        valArr("favorites");
        break;
      case "cart":
        valArr("cart");
        break;

      case "address":
        valString("street", 3, 50, letters);
        valString("zipCode", 3, 10, numbersOnly);
        valString("houseNumber", 1, 4, numbersOnly);
        valString("city", 3, 50, letters);
        break;

      case "payment":
        valObj("payment");

        if (data[part].billingAddress) {
          valObj("billingAddress");
          valString("billingAddress.street", 3, 50, letters);
          valString("billingAddress.zipCode", 3, 10, numbersOnly);
          valString("billingAddress.houseNumber", 1, 4, numbersOnly);
          valString("billingAddress.city", 3, 50, letters);
        }
        if (data[part].shippingAddress) {
          valObj("shippingAddress");
          valString("shippingAddress.street", 3, 50, letters);
          valString("shippingAddress.zipCode", 3, 10, numbersOnly);
          valString("shippingAddress.houseNumber", 1, 4, numbersOnly);
          valString("shippingAddress.city", 3, 50, letters);
        }

        break;

      case "personalData":
        valString("firstname", 3, 20, letters);
        valString("secondName", 3, 20, letters);
        valString("lastname", 3, 20, letters);
        valString("phoneNumber", 10, 20, telNumber);
        break;
      default:
        console.warn(`Unknown part: ${part}`);

        break;
    }
  });

  return errors;
};

export const updateUserAdminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validateFields(req.body);
  console.log(req.body);

  if (errors.length > 0) errorResponse(res, 400, "Validation error", errors);
  next();
};
