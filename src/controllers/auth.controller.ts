import { Request, Response } from "express";
import User from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "geheimesToken";

//
// 📝 REGISTER – Neuer Benutzer registrieren
//
export const register = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      secondName, 
      lastName,
      email,
      password,
      userName,
    } = req.body;

  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "E-Mail ist bereits registriert." });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);

 
    const newUser = new User({
      firstName,
      secondName,
      lastName,
      email,
      password: hashedPassword,
      userName,
    });

    await newUser.save();


    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: "2h" });


    const userWithToken = {
      _id: newUser._id,
      firstName: newUser.firstName,
      secondName: newUser.secondName,
      lastName: newUser.lastName,
      email: newUser.email,
      userName: newUser.userName,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      token,
    };

    res.status(201).json({ message: "Registrierung erfolgreich!", user: userWithToken });
  } catch (error) {
    console.error("❌ Registrierung fehlgeschlagen:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
};

//
// 🔐 LOGIN – Benutzeranmeldung
//
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Ungültige E-Mail oder Passwort." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Ungültige E-Mail oder Passwort." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "2h" });

    const userWithToken = {
      _id: user._id,
      firstName: user.firstName,
      secondName: user.secondName,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    };

    res.status(200).json({ message: "Anmeldung erfolgreich!", user: userWithToken });
  } catch (error) {
    console.error("❌ Anmeldung fehlgeschlagen:", error);
    res.status(500).json({ message: "Interner Serverfehler." });
  }
};
