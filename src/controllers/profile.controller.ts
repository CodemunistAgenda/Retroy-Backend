import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";

import Address, { type AddressDocument } from "../models/address.model.ts";
import PersonalData from "../models/personalData.model.ts";
import User from "../models/user.model.ts";
import { humanVerification } from "../middleware/reCaptcha.ts";
import { errorResponse, successResponse } from "../utils/helper.function.ts";
import type { Document } from "mongoose";

/**
 * @desc create new profile
 * @route POST /user/profile/:id
 */

interface ProfileRequest extends Request {
  user?: {
    id: string;
  };
}

export const updatePersonalData = async (req: ProfileRequest, res: Response): Promise<void> => {
  const VERIFYING = process.env.VERIFYING;

  try {
    const isHuman = VERIFYING === "true" ? await humanVerification(req.body.captchaToken) : true;
    if (!isHuman) {
      res.status(400).json({ message: "Captcha verification failed" });
      return;
    }

    const userId = req.user?.id; // ID from the token

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // personal information
    const { firstname, secondname, lastname, phoneNumber } = req.body.personalData;
    const profil = new PersonalData({
      userId,
      firstname,
      secondName: secondname ? secondname : undefined,
      lastname,
      phoneNumber,
    });
    await profil.save();

    const { privateAddress, billingAddress, shippingAddress, customAddress } = req.body;

    // address
    const addresses = [];

    if (privateAddress) {
      addresses.push({
        insertOne: {
          document: {
            userId,
            type: "privat",
            ...privateAddress,
          },
        },
      });
    }

    if (billingAddress) {
      addresses.push({
        insertOne: {
          document: {
            userId,
            type: "billing",
            ...billingAddress,
          },
        },
      });
    }

    if (shippingAddress) {
      addresses.push({
        insertOne: {
          document: {
            userId,
            type: "shipping",
            ...shippingAddress,
          },
        },
      });
    }

    if (customAddress) {
      addresses.push({
        insertOne: {
          document: {
            userId,
            type: "custom",
            ...customAddress,
          },
        },
      });
    }

    let insertesAddresses: Document[] = [];

    if (addresses.length > 0) {
      const result = await Address.bulkWrite(addresses);

      insertesAddresses = await Address.find({ userId }).sort({ _id: -1 }).limit(addresses.length);
    }

    user.personalData = profil._id;

    for (const addr of insertesAddresses as any) {
      if (addr.type === "privat") user.privateAddress = addr._id;
      if (addr.type === "billing") user.billingAddress = addr._id;
      if (addr.type === "shipping") user.shippingAddress = addr._id;
      if (addr.type === "custom") user.customAddress = addr._id;
    }

    await user.save();

    successResponse(res, 201, "User datas Updates within the profile", user);
  } catch (err) {
    errorResponse(res, 500, "Server error", err instanceof Error ? err.message : "Unknown error");
  }
};
