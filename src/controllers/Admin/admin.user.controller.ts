import { type Request, type Response } from "express";
import { errorResponse } from "../../utils/helper.function";
import User from "../../models/user.model";
import { type AddressType } from "../../models/address.model";

interface populatesUser {
  address?: AddressType;
  orders?: string[];
  favorites?: string[];
  cart?: string[];
  payment?: string[];
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      username,
      email,
      verified,
      deleted,
      zipCode,
      city,
      includeOrders,
      includePersonalData,
      includeFavorites,
      includeCart,
      includeAddress,
      includePayment,
    } = req.query;

    const filter: Record<string, any> = {};

    // hier wird der Query zusammengesetzt anhand von optionalen query params

    if (username) filter.username = { $regex: username, $options: "i" };
    if (email) filter.email = { $regex: email, $options: "i" };
    if (verified) filter.verified = verified === "true";
    if (deleted) filter["deleted.isDeleted"] = deleted === "true";

    let query = User.find(filter).select("-password -__v -createdAt -updatedAt");

    // hier werden die optionalen populate statements hinzugefügt

    if (includeOrders) query = query.populate("orders");
    if (includeFavorites) query = query.populate("favorites");
    if (includeCart) query = query.populate("cart");
    if (includePersonalData) query = query.populate("personalData");
    if (includePayment) query = query.populate("payment");
    if (zipCode || city || includeAddress) query = query.populate("address");

    let users = (await query.exec()) as unknown as populatesUser[];

    // manche find verschlüsselt nur durch getter bekommt man klartext
    users = users.map((user: any) => {
      if (includePayment && user.payment?.toObject) {
        user.payment = user.payment.toObject({ getters: true });
      }
      if (includePersonalData && user.personalData?.toObject) {
        user.personalData = user.personalData.toObject({ getters: true });
      }

      return user;
    });

    const zipFilter = zipCode
      ? users.filter(
          (user) =>
            user.address &&
            typeof user.address.zipCode === "string" &&
            user.address.zipCode.startsWith(zipCode as string)
        )
      : users;

    const cityFilter = city
      ? zipFilter.filter(
          (user) =>
            user.address && user.address.city && user.address.city.toLowerCase() === (city as string).toLowerCase()
        )
      : zipFilter;

    if (cityFilter.length === 0) {
      return errorResponse(res, 404, "No users found");
    }
    res.status(200).json({
      message: "Users found",
      data: cityFilter,
    });
    return;
  } catch (e) {
    return errorResponse(res, 500, "Error getting users", e);
  }
};
