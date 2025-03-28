import { type Request, type Response } from "express";

import Jwt from "jsonwebtoken";
import User from "../model/user.model.ts";

export const verifyUser = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ message: "No token provided" });
  }

  try {
    const decode = Jwt.verify(token as string, process.env.JWT_SECRET as string);
    const { email } = decode as { email: string };

    if (!email) {
      res.status(400).json({ message: "Invalid token" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    user.verified = true;
    await user.save();

    res.json({ message: "User verified successfully" });
  } catch (err) {
    console.error("Error verifying user: ", err);
    res.status(500).json({ message: "Server error" });
  }
};
