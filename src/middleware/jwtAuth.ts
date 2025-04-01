import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.ts";
import "dotenv/config.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>

  if (!token) res.status(401).json({ message: "Bitte loggen Sie sich ein" });

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT secret is not defined");
    }

    const decoded = jwt.verify(token as string, process.env.JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "User not Found" });
    }

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
    } else if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
