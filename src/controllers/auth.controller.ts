import { type Request, type Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "geheimesToken";

/**
 * @desc REGISTER – Neuer Benutzer registrieren
 */

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, userName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "E-Mail ist bereits registriert." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      userName,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "1h" });
  } catch (error) {
    res.status(500).json({ message: "Interner Serverfehler." });
  }
};

/**
 * @desc LOGIN – Benutzer anmelden
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;
    let user;

    if (!email && !username) {
      res.status(401).json({ message: "Bitte gibt username oder email an" });
      return;
    }

    if (email) {
      user = await User.findOne({ email });
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user || user.deleted?.isDeleted) {
      res.status(401).json({ message: "Benutzer nicht gefunden." });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Fehlerhafte Anmeldedaten." });
    }

    const token = jwt.sign({ userId: user?._id }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Anmeldung erfolgreich!" });
  } catch (err) {
    res.status(500).json({ message: "Interner Serverfehler.", error: err });
  }
};
