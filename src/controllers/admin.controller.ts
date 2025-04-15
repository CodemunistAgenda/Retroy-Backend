import bcrypt from "bcryptjs";
import { type Request, type Response, type NextFunction } from "express";
import { errorResponse } from "../utils/helper.function.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import WhiteList from "../models/whileList.model.js";

import "dotenv/config.js";

interface AdminAuth extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const showUserDetail = async (req: AdminAuth, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return errorResponse(res, 400, "User ID is required");
    }

    const user = await User.findOne({ _id: userId }).populate("profil").populate("address").populate("payment");

    // auch gelöschte User müssen für Admins sichtbar sein gezeigt werden

    if (!user) {
      return errorResponse(res, 404, "No User found with this ID");
    }

    res.status(200).json({ user });
  } catch (err) {
    return errorResponse(res, 500, "Error fetching user details", err);
  }
};

// WICHTIG die Whitelist darf nur mit einmal Passwort sichtbar sein (wird später sicher gestellt)
export const showWhiteList = async (req: AdminAuth, res: Response): Promise<void> => {
  console.log("Show whitelist");
  try {
    // das sollte die getters aktivieren macht es aber nicht
    const whitelist = await WhiteList.find({}).select("username email password -_id");

    if (!whitelist || whitelist.length === 0) {
      return errorResponse(res, 404, "No whitelist found");
    }

    // hier werden die getter aktiviert
    const plain = whitelist.map((entry) => entry.toObject({ getters: true }));

    res.status(200).json({ whitelist: plain });
  } catch (error) {
    res.status(500).json({ message: "Error fetching whitelist", error });
  }
};

// export const showProductsOfUser = async
