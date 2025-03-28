import express, { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import Validator from "validator";
import jwt from "jsonwebtoken";
import zxcvbn from "zxcvbn";

import User from "../model/user.model.ts";
import { blacklistedMails } from "../utils/tempmailing.ts";
import { sendVerficationEmail } from "../middleware/sendingMails.ts";

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // IP limit
  message: "Too many requests, please try again later.",
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { Firstname, secondName, Lastname, email, password, username } = req.body;

  try {
    if (!Firstname || !Lastname || !email || !password || !username) {
      res.status(400).json({ message: "Please fill all fields" });
    }

    if (!Validator.isEmail(email)) {
      res.status(400).json({ message: "Invalid email" });
    }

    const mailDomain = email.split("@")[1].toLowerCase();
    if (blacklistedMails.includes(mailDomain)) {
      res.status(400).json({ message: "Temporary email addresses are not allowed" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "this mail is in use" });
    }

    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 3) {
      res.status(400).json({
        message: passwordStrength.feedback.suggestions.join(" "),
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    if (!hashedPassword) {
      res.status(500).json({ message: "Error hashing password" });
      return;
    }

    const newUser = new User({
      firstName: Firstname,
      secondName,
      lastName: Lastname,
      email,
      password: hashedPassword,
      userName: username,
    });
    await newUser.save();

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    await sendVerficationEmail(email, verificationToken);

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {};
