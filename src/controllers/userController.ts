import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import Validator from "validator";
import jwt from "jsonwebtoken";
import zxcvbn from "zxcvbn";

import User from "../models/user.model.ts";
import { blacklistedMails } from "../utils/tempmailing.ts";
import { sendVerficationEmail } from "../middleware/sendingMails.ts";

/**
 * @desc Register a new user, hash the password, and send a verification email
 * @route POST /user/register
 */

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password || !username) {
      res.status(400).json({ message: "Please fill all fields" });
      return;
    }

    if (!Validator.isEmail(email)) {
      res.status(400).json({ message: "Invalid email" });
      return;
    }

    const mailDomain = email.split("@")[1].toLowerCase();
    if (blacklistedMails.includes(mailDomain)) {
      res.status(400).json({ message: "Temporary email addresses are not allowed" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "this mail is in use" });
      return;
    }

    const passwordStrength = zxcvbn(password);
    if (passwordStrength.score < 3) {
      res.status(400).json({
        message: passwordStrength.feedback.suggestions.join(" "),
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    if (!hashedPassword) {
      res.status(500).json({ message: "Error hashing password" });
      return;
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      username: username,
    });

    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    await sendVerficationEmail(email, verificationToken);
    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Login a user
 * @route POST /api/user/login
 */

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    if (!password) {
      res.status(400).json({ message: "Enter a password!" });
      return;
    }

    if (!email && !username) {
      res.status(400).json({ message: "Please enter email or username" });
      return;
    }
    let user;

    if (email) {
      if (!Validator.isEmail(email)) {
        res.status(400).json({ message: "Invalid email" });
        return;
      }
      user = await User.findOne({ email });
      if (!user || user.deleted?.isDeleted) {
        res.status(400).json({ message: "Login failed wrong credentials" });
        return;
      }
    } else if (username) {
      if (!Validator.isAlphanumeric(username)) {
        res.status(400).json({ message: "Invalid username" });
        return;
      }
      user = await User.findOne({ username: username });
      if (!user || user.deleted?.isDeleted) {
        res.status(404).json({ message: "Login failed wrong credentials" });
        return;
      }
    }

    const passwordMatch = await bcrypt.compare(password, user?.password as string);

    if (!passwordMatch) {
      res.status(400).json({ message: "Login failed wrong credentials" });
      return;
    }

    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/** 
 * @desc Deleting (Softdelete) a user
 * @route POST /api/user/delete/:id

*/

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { reason } = req.body;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "No user registered with this ID" });
      return;
    }

    if (user.deleted?.isDeleted) {
      res.status(400).json({ message: "Deleting request failed, user is already deleted" });
      return;
    }

    user.deleted = {
      isDeleted: true,
      deletedAt: new Date(),
      reason: reason || "No reason provided",
    };

    await user.save();
    res.status(200).json({ message: "User marked for deletion" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err });
  }
};

/**
 * @desc Restore a deleted user
 * @route POST /api/user/restore/:id
 */

export const restore = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "No user registered with this ID" });
      return;
    }

    if (user.deleted?.isDeleted === false) {
      res.status(400).json({ message: "Restore Request failed, user isnt deleted." });
      return;
    }

    user.deleted = {
      isDeleted: false,
      deletedAt: null as unknown as Date,
      reason: null as unknown as string,
    };

    await user.save();
    res.status(200).json({ message: "User restored successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error restoring user", error: err });
  }
};
