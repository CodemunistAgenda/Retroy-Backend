import { errorResponse } from "../utils/helper.function";
import { numbersOnly, onlyLetters, striptCustomer } from "../utils/regex";
import { validateAddress } from "./address.validation";
import { type Request, type Response, type NextFunction } from "express";

// helper function to validate data

export const validateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { personalData, privateAddress, stripeCustomerId, shippingAddress, billingAddress } = req.body;

  if (!personalData) {
    return errorResponse(res, 400, "Personal data is required");
  }

  const { firstname, secondName, lastname, phoneNumber } = personalData;
  const valString = (value: string, min: number, max: number, regex: RegExp) => {
    if (value.length < min || value.length > max) {
      return errorResponse(res, 400, `Length of ${value} must be between ${min} and ${max}`);
    }
  };

  valString(firstname, 3, 20, onlyLetters);
  if (secondName) valString(secondName, 3, 20, onlyLetters);
  valString(lastname, 3, 20, onlyLetters);
  valString(phoneNumber, 10, 15, numbersOnly);

  const privateAddressErrors = validateAddress(privateAddress);
  const billingAddressErrors = validateAddress(billingAddress);
  const shippingAddressError = validateAddress(shippingAddress);

  if (privateAddressErrors) {
    return errorResponse(res, 400, `Problems with privatAddress: ${privateAddressErrors.join(",\n")}`);
  } else if (billingAddressErrors) {
    return errorResponse(res, 400, `Problems with billingAddress: ${billingAddressErrors.join(",\n")}`);
  } else if (shippingAddressError) {
    return errorResponse(res, 400, `Problems with shippingAddress: ${shippingAddressError.join(",\n")}`);
  }

  if (stripeCustomerId && !striptCustomer.test(stripeCustomerId)) {
    return errorResponse(res, 400, `Invalid stripeCustomerId: ${stripeCustomerId}`);
  }

  next();
};
