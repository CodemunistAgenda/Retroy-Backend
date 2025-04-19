import type { AddressType } from "../models/address.model";
import { letterAndPunctuation, numbersOnly, onlyLetters } from "../utils/regex";

export const validateAddress = (address: AddressType) => {
  const errors: string[] = [];

  const { street, city, zipCode, houseNumber } = address;
  if (!street || !city || !zipCode || !houseNumber) {
    errors.push(`Street, city, zipCode and houseNumber are required\n`);
  }

  const valString = (val: string, min: number, max: number, regex: RegExp) => {
    if (val.length < min || val.length > max) {
      errors.push(`Length of ${val} must be between ${min} and ${max}\n`);
    }
    if (!regex.test(val)) {
      errors.push(`Invalid format for ${val}\n`);
    }
  };

  valString(street, 3, 25, letterAndPunctuation);
  valString(city, 3, 25, onlyLetters);
  valString(zipCode, 4, 5, numbersOnly);
  valString(houseNumber, 1, 4, numbersOnly);

  if (errors.length > 0) {
    return errors;
  }

  return null;
};
