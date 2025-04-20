import { type Request, type Response } from "express";
import { errorResponse, successResponse } from "../../utils/helper.function";
import User, { type UserDocument } from "../../models/user.model";
import { type AddressDocument } from "../../models/address.model";
import { type PersonalDataType } from "../../models/personalData.model";
import Order, { type OrderDoc } from "../../models/order.model";
import { type CartDocument } from "../../models/cart.model";
import type { Document, Types } from "mongoose";
import { sendInformationsEmail } from "../../middleware/sendingMails";

interface populatesUser
  extends Omit<
    UserDocument,
    | "personalData"
    | "payment"
    | "privateAddress"
    | "shippingAddress"
    | "billingAddress"
    | "orders"
    | "cart"
    | "favorites"
  > {
  personalData: PersonalDataDoc;
  privateAddress?: AddressDocument;
  billingAddress?: AddressDocument;
  shippingAddress?: AddressDocument;
  orders?: OrderDoc[];
  favorites?: string[];
  cart?: CartDocument;
}

//man kann beim updaten eine bereits verwendete email angeben als user email addresse das muss behaben werden

interface PersonalDataDoc extends PersonalDataType, Document {}

interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: ["user", "admin", "seller", "moderator"];
    verified?: boolean;
  };
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
    if (zipCode || city || includeAddress) query = query.populate("privateAddress");

    let users = (await query.exec()) as unknown as populatesUser[];

    const zipFilter = zipCode
      ? users.filter(
          (user) =>
            user.privateAddress &&
            typeof user.privateAddress.zipCode === "string" &&
            user.privateAddress.zipCode.startsWith(zipCode as string)
        )
      : users;

    const cityFilter = city
      ? zipFilter.filter(
          (user) =>
            user.privateAddress &&
            user.privateAddress.city &&
            user.privateAddress.city.toLowerCase() === (city as string).toLowerCase()
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

export const adminUserUpdate = async (req: Request, res: Response): Promise<void> => {
  console.log("adminUserUpdate");

  // guard typisierung:
  function isPopulated<T>(doc: T | Types.ObjectId): doc is T {
    return typeof doc === "object" && doc !== null && !("_id" in doc);
  }

  try {
    const targetId = req.params.id;
    const { userUpdates, personalData, privateAddress, billingAddress, shippingAddress, orders, favorites, cart } =
      req.body;
    let query = User.findOne({ _id: targetId }).select("-password -__v -createdAt -updatedAt");

    if (personalData)
      query.populate({
        path: "personalData",
        select: "-__v -_id -createdAt",
      });
    if (privateAddress)
      query.populate({
        path: "privateAddress",
        select: "houseNumber street city zipCode",
      });
    if (billingAddress)
      query.populate({
        path: "billingAddress",
        select: "houseNumber street city zipCode",
      });
    if (shippingAddress)
      query.populate({
        path: "shippingAddress",
        select: "houseNumber street city zipCode",
      });
    if (orders) query.populate({ path: "orders", select: "" });
    if (favorites) query.populate({ path: "favorites", select: "" });
    if (cart) query.populate({ path: "cart", select: "" });

    const rawUser = await query.exec();

    if (!rawUser) {
      errorResponse(res, 404, "User not found");
      return;
    }

    const targetUser = rawUser as unknown as populatesUser;

    // alle werte im direkten body werden in den user geschrieben
    if (userUpdates) {
      if (userUpdates.email) {
        const inUse = await User.findOne({ email: userUpdates.email });

        if (inUse && inUse._id.toString() !== targetUser._id.toString()) {
          return errorResponse(res, 400, "Email already in use");
        }
      }
      Object.assign(targetUser, userUpdates);
    }

    // hier wird der user in die jeweilige collection geschrieben

    if (personalData && isPopulated(targetUser.personalData) && targetUser.personalData) {
      Object.assign(targetUser.personalData, personalData);
      await targetUser.personalData.save();
    }

    if (privateAddress && targetUser.privateAddress) {
      Object.assign(targetUser.privateAddress, privateAddress);
      await targetUser.privateAddress.save();
    }

    if (billingAddress && targetUser.billingAddress) {
      Object.assign(targetUser.billingAddress, billingAddress);
      await targetUser.billingAddress.save();
    }

    if (shippingAddress && targetUser.shippingAddress) {
      Object.assign(targetUser.shippingAddress, shippingAddress);
      await targetUser.shippingAddress.save();
    }

    if (orders && Array.isArray(targetUser.orders)) {
      for (const [index, orderUpdate] of orders.entries()) {
        const orderDoc = targetUser.orders[index];
        if (orderDoc) {
          Object.assign(orderDoc, orderUpdate);
          await orderDoc.save();
        }
      }
    }

    // exsitiert noch nicht
    /*  if (favorites && targetUser.favorites) {
      Object.assign(targetUser.favorites, favorites);
      await (targetUser.favorites as favoritesType).save();
    } */

    if (cart && targetUser.cart) {
      Object.assign(targetUser.cart, cart);
      await targetUser.cart.save();
    }

    try {
      await targetUser.save();
    } catch (e) {
      errorResponse(res, 500, "Error saving user", e);
      return;
    }
    if (personalData && targetUser.personalData?.toObject) {
      targetUser.personalData = targetUser.personalData.toObject({ getters: true });
    }

    console.log("personal daten: ", targetUser.personalData);

    let emailtext = `
      <h2>Dear ${targetUser.username}</h2>
      <p>We sending you this mail to inform you some information at your account has changes by an Admin</p>

      <p>In this Categogie(s) we changed informations</p>
      <ul>
        ${userUpdates ? `<li>Account</li>` : ""} 
        ${personalData ? `<li>Personal Data</li>` : ""}
        ${privateAddress ? `<li>Private Address</li>` : ""}
        ${billingAddress ? `<li>Billing Address</li>` : ""}
        ${shippingAddress ? `<li>Shipping Address</li>` : ""} 
        ${orders ? `<li>Orders</li>` : ""}${favorites ? `<li>Favorites</li>` : ""} 
        ${cart ? `<li>Cart</li>` : ""}
      </ul>
      <p>
        If you have any questions, feel free to contact us: <a href="mailto:${process.env.ADMIN_EMAIL}">User Support</a>
      </p>

      <p>We protect your data and all changes are DSGVO confirm</p>
    `;

    sendInformationsEmail("norman.tetzlaff@dci-student.org", "informations in your account has changed", emailtext);

    successResponse(res, 200, "user successfully updated");
  } catch (e) {
    return errorResponse(res, 500, "Error updating user", e);
  }
};

export const restoreUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = req.params.id;

    if (!targetId) {
      return errorResponse(res, 400, "No user id provided");
    }

    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      return errorResponse(res, 404, "User not found");
    }

    if (targetUser.deleted?.isDeleted === false) {
      errorResponse(res, 400, "Restoring request failed, user is not deleted");
      return;
    }
    targetUser.deleted = {
      isDeleted: false,
      deletedAt: null as unknown as Date,
      reason: null as unknown as string,
      deletedBy: null as unknown as string,
    };

    await targetUser.save();

    const supportEmail = process.env.SUPPORT_EMAIL;
    if (!supportEmail) return errorResponse(res, 500, "cant find support email");
    const text = `<h2>Dear ${targetUser.username}</h2>
        <p>Your request to restore your account has been approved.</p>
        <p>All your offers have been restored.</p>
        <p>If you have any questions, feel free to contact us: <a href="mailto:${supportEmail}">User Support</a></p>
        <p>We protect your data and all changes are DSGVO confirm</p>`;

    if (process.env.VERIFYING === "true") {
      sendInformationsEmail(targetUser.email, "Your account has been restored", text);
    }

    return successResponse(res, 200, "User restored successfully", targetUser);
  } catch (err) {
    errorResponse(res, 500, "Error restoring user", err);
  }
};

export const deleteUserByAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const admin = req.user?.id;

    if (!id) return errorResponse(res, 400, "No user id provided");

    if (!admin) return errorResponse(res, 400, "No admin id provided");

    const target: UserDocument | null = await User.findById(id);
    if (!target) return errorResponse(res, 404, "no User with this id found");
    if (target.deleted?.isDeleted === true) return errorResponse(res, 400, "User already deleted");

    target.deleted = {
      isDeleted: true,
      deletedAt: new Date(),
      reason: reason || "no reason provided",
      deletedBy: admin,
    };

    await target.save();

    let supportEmail = process.env.SUPPORT_EMAIL;
    if (!supportEmail) {
      return errorResponse(res, 500, "cant find support email");
    }

    console.log(target);

    let text = `
        <h2>Dear ${target.username},</h2>
        <p>We regret to inform you that your account has been deleted</p>
        <p>All pending orders will be delivered, but you will not longer be able to cancel, or refund them!
        if you need to, you can contact our support team: <a href="mailto${supportEmail}"></p>
        <p>Reason: ${reason || "No reason provided"}</p>
        <p>If you have any questions, feel free to contact us: <a href="mailto:${supportEmail}">User Support</a></p>
        <br>
        <p>Best regards,</p>
        <p>Retroy Customer Support</p>
      `;

    console.log("text", text);

    if (process.env.VERIFYING === "true") sendInformationsEmail(target.email, "Account deleted", text);

    return successResponse(res, 200, "User deleted successfully, and email sended", target);
  } catch (err) {
    return errorResponse(res, 500, "Error deleting user", err);
  }
};
