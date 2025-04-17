import { type Request, type Response } from "express";
import { errorResponse, successResponse } from "../../utils/helper.function";
import User, { type UserDocument } from "../../models/user.model";
import { type AddressType } from "../../models/address.model";
import { type PersonalDataType } from "../../models/personalData.model";
import { type PaymentType } from "../../models/payment.model";
import Order, { type OrderType } from "../../models/order.model";
import { type CartType } from "../../models/cart.model";
import Product, { type ProductDocument } from "../../models/product.model";
import type { Document, Types } from "mongoose";
import { sendInformationsEmail } from "../../middleware/sendingMails";

interface populatesUser
  extends Omit<UserDocument, "personalData" | "payment" | "address" | "orders" | "cart" | "favorites"> {
  personalData: PersonalDataDoc;
  payment?: PaymentDoc;
  address?: AddressDoc;
  orders?: OrderDoc[];
  favorites?: string[];
  cart?: CartDoc;
}

//man kann beim updaten eine bereits verwendete email angeben als user email addresse das muss behaben werden

interface PersonalDataDoc extends PersonalDataType, Document {}
interface PaymentDoc extends PaymentType, Document {}
interface AddressDoc extends AddressType, Document {}

// es kann zu konflikten kommen wenn die Objekte komplexer werden aber ich weis nicht wie ich das sonst lösen soll
type OrderDoc = OrderType & Document;
type CartDoc = CartType & Document;

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

export const adminUserUpdate = async (req: Request, res: Response): Promise<void> => {
  console.log("adminUserUpdate");

  // guard typisierung:
  function isPopulated<T>(doc: T | Types.ObjectId): doc is T {
    return typeof doc === "object" && doc !== null && !("_id" in doc);
  }

  try {
    const targetId = req.params.id;
    const { userUpdates, personalData, payment, address, orders, favorites, cart } = req.body;
    let query = User.findOne({ _id: targetId }).select("-password -__v -createdAt -updatedAt");

    if (personalData) query.populate("personalData");
    if (payment) query.populate("payment");
    if (address) query.populate("address");
    if (orders) query.populate("orders");
    if (favorites) query.populate("favorites");
    if (cart) query.populate("cart");

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

    if (payment && targetUser.payment) {
      Object.assign(targetUser.payment, payment);

      if (payment.billingAddress !== undefined) {
        console.log("billingAddress", payment.billingAddress);

        const newBilling = payment.billingAddress;

        // fallback auf privaten address
        if (newBilling === null) {
          if (targetUser.address?._id) {
            targetUser.payment.billingAddress = targetUser.address._id;
          }
        } else if (typeof newBilling === "object") {
          console.log("billingAddress in type objekt", newBilling);
          if (
            typeof newBilling.street !== "string" ||
            typeof newBilling.zipCode !== "string" ||
            typeof newBilling.city !== "string" ||
            typeof newBilling.houseNumber !== "string"
          ) {
            console.log("type of: ", typeof newBilling.street);
            console.log("type of: ", typeof newBilling.zipCode);
            console.log("type of: ", typeof newBilling.city);
            console.log("type of: ", typeof newBilling.houseNumber);
            console.log("billingAddress in type objekt", newBilling);

            return errorResponse(res, 400, "error while updating billing address", newBilling);
          }

          Object.assign(targetUser.payment.billingAddress, newBilling);
        } else {
          return errorResponse(res, 400, "error while updating billing address", newBilling);
        }
      }

      if (payment.shippingAddress !== undefined) {
        console.log("shippingAddress", payment.shippingAddress);

        const newShipping = payment.shippingAddress;

        // fallback auf privaten address
        if (newShipping === null) {
          if (targetUser.address?._id) {
            targetUser.payment.shippingAddress = targetUser.address._id;
          }
        } else if (typeof newShipping === "object") {
          if (
            typeof newShipping.street !== "string" ||
            typeof newShipping.zipCode !== "string" ||
            typeof newShipping.city !== "string" ||
            typeof newShipping.houseNumber !== "string"
          ) {
            return errorResponse(res, 400, "error while updating shipping address", newShipping);
          }

          Object.assign(targetUser.payment.shippingAddress, newShipping);
        } else {
          return errorResponse(res, 400, "error while updating shipping address", newShipping);
        }
      }

      await targetUser.payment.save();
    }

    if (address && targetUser.address) {
      Object.assign(targetUser.address, address);
      await targetUser.address.save();
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
    // um die daten wieder in klartext zu bekommen müssen wir diese entschlüsseln

    if (payment && targetUser.payment?.toObject) {
      targetUser.payment = targetUser.payment.toObject({ getters: true });
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
        ${userUpdates ? `<li>Account</li>` : ""} ${personalData ? `<li>Personal Data</li>` : ""}
        ${payment ? `<li>Payment</li>` : ""} ${address ? `<li>Address</li>` : ""} ${orders ? `<li>Orders</li>` : ""}
        ${favorites ? `<li>Favorites</li>` : ""} ${cart ? `<li>Cart</li>` : ""}
      </ul>
      <p>
        If you have any questions, feel free to contact us: <a href="mailto:${process.env.ADMIN_EMAIL}">User Support</a>
      </p>

      <p>We protect your data and all changes are DSGVO confirm</p>
    `;

    sendInformationsEmail("norman.tetzlaff@dci-student.org", "informations in your account has changed", emailtext);

    res.status(200).json({
      message: "User updated",
      data: targetUser,
    });
  } catch (e) {
    return errorResponse(res, 500, "Error updating user", e);
  }
};

export const restoreUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetId = req.params.id;

    if (!targetId) {
      errorResponse(res, 400, "No user id provided");
      return;
    }

    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      errorResponse(res, 404, "User not found");
      return;
    }

    if (targetUser.deleted?.isDeleted === false) {
      errorResponse(res, 400, "Restoring request failed, user is not deleted");
      return;
    }

    const productsOfUser: ProductDocument[] | null = await Product.find({ salesperson: targetUser._id });
    if (productsOfUser) {
      for (const product of productsOfUser) {
        if (product.deleted.reason === "User has been deleted") {
          product.deleted = {
            isDeleted: false,
            deletedAt: null as unknown as Date,
            reason: null as unknown as string,
            deletedBy: null as unknown as string,
          };
          await product.save();
        }
      }
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

    console.log("targetUser", targetUser);
    console.log("text", text);

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

    const productsOfUser: ProductDocument[] | null = await Product.find({ salesperson: target._id });

    if (productsOfUser) {
      for (const product of productsOfUser) {
        product.deleted = {
          isDeleted: true,
          deletedAt: new Date(),
          reason: "User has been deleted",
          deletedBy: admin,
        };
        console.log("product", product);
        await product.save();
      }
    }
    target.deleted = {
      isDeleted: true,
      deletedAt: new Date(),
      reason: reason || "no reason provided",
      deletedBy: admin,
    };

    console.log("target", target);

    await target.save();

    let supportEmail = process.env.SUPPORT_EMAIL;
    if (!supportEmail) {
      return errorResponse(res, 500, "cant find support email");
    }

    console.log(target);

    let text = `
        <h2>Dear ${target.username},</h2>
        <p>We regret to inform you that your account has been deleted</p>
        <p>All your offers have been deleted to</p>
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

    return successResponse(res, 200, "User deleted successfully", target);
  } catch (err) {
    return errorResponse(res, 500, "Error deleting user", err);
  }
};
