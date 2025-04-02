import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";

import Address from "../models/address.model.ts";
import Profil from "../models/personalData.model.ts";
import Payment from "../models/payment.model.ts";
import User from "../models/user.model.ts";
import { humanVerification } from "../middleware/reCaptcha.ts";

/**
 * @desc create new profile
 * @route POST /user/profile/:id
 */

interface ProfileRequest extends Request {
  user?: {
    id: string;
  };
}

export const createProfile = async (req: ProfileRequest, res: Response): Promise<void> => {
  const VERIFYING = process.env.VERIFYING;

  try {
    const isHuman = VERIFYING === "true" ? await humanVerification(req.body.captchaToken) : true;
    if (!isHuman) {
      res.status(400).json({ message: "Captcha verification failed" });
      return;
    }

    const userId = req.user?.id; // ID from the token
    const { password, ...body } = req.body;

    if (!password) {
      res.status(400).json({ message: "Enter your password" });
      return;
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Bad credentials" });
      return;
    }

    const hasProfil = user.profil;
    if (hasProfil) {
      res.status(400).json({ message: "Profile already exists" });
      return;
    }

    // personal information
    const { firstname, secondname, lastname, phoneNumber } = body.personalData;
    const personalData = new Profil({
      userId,
      firstname,
      secondName: secondname ? secondname : undefined,
      lastname,
      phoneNumber,
    });

    // address
    const { street, houseNumber, city, zipCode } = body.address;
    const address = new Address({
      userId,
      street,
      houseNumber,
      city,
      zipCode,
    });

    // Payment
    const { primary, creditCard, paypal, bankTransfer } = body.payment;
    const { shippingAddress, billingAddress } = body.payment;

    console.log("body", body);

    console.log("billingAddress", billingAddress);

    const payments = new Payment({
      userId,
      primary,
      creditCard: creditCard ? { cardToken: creditCard.cardToken } : undefined,
      paypal: paypal
        ? {
            email: paypal.email,
          }
        : undefined,
      bankTransfer: bankTransfer
        ? {
            bankAccountNumber: bankTransfer.bankAccountNumber,
            bankName: bankTransfer.bankName,
            iban: bankTransfer.iban,
            bic: bankTransfer.bic,
          }
        : undefined,
      shippingAddress: shippingAddress
        ? {
            userId,
            street: shippingAddress.street,
            houseNumber: shippingAddress.houseNumber,
            city: shippingAddress.city,
            zipCode: shippingAddress.zipCode,
          }
        : address._id,
      billingAddress: billingAddress
        ? {
            userId,
            street: billingAddress.street,
            houseNumber: billingAddress.houseNumber,
            city: billingAddress.city,
            zipCode: billingAddress.zipCode,
          }
        : address._id,
    });

    await personalData.save();
    await address.save();
    await payments.save();

    user.profil = personalData._id;
    user.address = address._id;
    user.payment = payments._id;

    await user.save();

    res.status(201).json({
      message: "Profile created successfully, and user updated",
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error, while creating profile",
      error: err,
    });
  }
};
