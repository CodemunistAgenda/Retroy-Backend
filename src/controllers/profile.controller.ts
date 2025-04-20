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
        updateOne: {
          filter: { userId, type: "privat" },
          update: { $set: { ...privateAddress } },
          upsert: true,
        },
      });
    }

    if (billingAddress) {
      addresses.push({
        updateOne: {
          filter: { userId, type: "billing" },
          update: { $set: { ...billingAddress } },
          upsert: true,
        },
      });
    }

    if (shippingAddress) {
      addresses.push({
        updateOne: {
          filter: { userId, type: "shipping" },
          update: { $set: { ...shippingAddress } },
          upsert: true,
        },
      });
    }

    if (customAddress) {
      addresses.push({
        updateOne: {
          filter: { userId, type: "custom" },
          update: { $set: { ...customAddress } },
          upsert: true,
        },
      });
    }

    let updatedAddresses: Document[] = [];

    if (addresses.length > 0) {
      await Address.bulkWrite(addresses);
      updatedAddresses = await Address.find({ userId }).sort({ _id: -1 }).limit(addresses.length);
    }

    user.personalData = profil._id;

    for (const addr of updatedAddresses as any) {
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

export const getme = async (req: ProfileRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id; // ID from the token

    const user = await User.findById(userId)

      // Tel number muss noch encrypet werden
      .populate({
        path: "personalData",
        select: "-__v -deleted -userId -_id -createdAt -updatedAt",
      })
      .populate({
        path: "privateAddress",
        select: "houseNumber street zipCode city -_id",
      })
      .populate({
        path: "billingAddress",
        select: "houseNumber street zipCode city -_id",
      })
      .populate({
        path: "shippingAddress",
        select: "houseNumber street zipCode city -_id",
      })
      .populate({
        path: "customAddress",
        select: "houseNumber street zipCode city -_id",
      })
      .select("-password -__v -deleted -role -_id -createdAt -updatedAt");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    successResponse(res, 200, "User profile", user);
  } catch (err) {
    errorResponse(res, 500, "Server error", err instanceof Error ? err.message : "Unknown error");
  }
};
