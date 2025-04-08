import { type Request, type Response, type NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import User from "../models/user.model.ts";
import "dotenv/config.js";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    console.log("🧩 [Middleware] Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("⚠️ Kein Bearer Token gefunden!");
      res.status(401).json({ message: "Bitte loggen Sie sich ein" });
      return;
    }

    const parts = authHeader.split(" ");
    const token = parts[1];
    console.log("🔑 [Middleware] Extracted Token:", token);

    if (!token) {
      res.status(401).json({ message: "Token fehlt" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT secret is not defined");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log("✅ [Middleware] Decoded Token:", decoded);

    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      console.error("❌ Ungültiger Tokeninhalt:", decoded);
      res.status(401).json({ message: "Ungültiger Tokeninhalt" });
      return;
    }

    req.user = { id: decoded.id as string };
    console.log("👤 [Middleware] User ID from Token:", decoded.id);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.error("🚫 Benutzer nicht gefunden in DB für ID:", decoded.id);
      res.status(401).json({ message: "Benutzer wurde nicht gefunden" });
      return;
    }

    console.log("🎉 Benutzer gefunden:", user.username || user.email);
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Bitte melden sie sicher erneut an" });
      return;
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    } else {
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
};

export default authMiddleware;
