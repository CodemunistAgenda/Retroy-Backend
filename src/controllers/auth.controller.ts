import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import validator, { escape } from "validator";
import jwt from "jsonwebtoken";
import zxcvbn from "zxcvbn";

import User from "../models/user.model.ts";
import Cart from "../models/cart.model.ts";

import { blacklistedMails } from "../utils/tempmailing.ts";
import { sendVerficationEmail } from "../middleware/sendingMails.ts";
import { humanVerification } from "../middleware/reCaptcha.ts";

const JWT_ACCESS_EXPIRATION = "1h"; // JWT expiration time
const JWT_REFRESH_EXPIRATION = "7d";

/**
 * @desc Register a new user, hash the password, and send a verification email
 * @route POST /user/register
 */

export const register = async (req: Request, res: Response): Promise<void> => {
  let { email, password, username, captchaToken } = req.body;
  email = validator.escape(email);
  password = validator.escape(password);
  username = validator.escape(username);

  const VERIFYING = process.env.VERIFYING;

  try {
    const isHuman = VERIFYING === "true" ? await humanVerification(captchaToken) : true;
    if (!isHuman) {
      res.status(400).json({ message: "Captcha verification failed" });
      return;
    }

    if (!email || !password || !username) {
      res.status(400).json({ message: "Please fill all fields" });
      return;
    }

    if (!validator.isEmail(email)) {
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

    const hashedPassword = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
    if (!hashedPassword) {
      res.status(500).json({ message: "Error hashing password" });
      return;
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      username: username,
    });

    const cart = new Cart({
      user: newUser._id,
      items: [],
    });

    newUser.cart = cart._id;

    if (VERIFYING === "true") {
      const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET as string, {
        expiresIn: "1h",
      });

      await sendVerficationEmail(email, verificationToken);
    }

    await newUser.save();
    await cart.save();

    // log the user in automatically
    const accessToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, {
      expiresIn: JWT_ACCESS_EXPIRATION,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true, // ist nicht per JS zugänglich (document.cookie)
      secure: process.env.NODE_ENV === "production", // wenn true, dann wird der cookie nur über HTTPS gesendet
      sameSite: "strict", //
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * @desc Login a user
 * @route POST /user/login
 */

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    let { email, username, password, remeberMe } = req.body;
    email !== undefined ? validator.escape(email) : email;
    username !== undefined ? validator.escape(username) : username;
    password !== undefined ? validator.escape(password) : password;

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
      if (!validator.isEmail(email)) {
        res.status(400).json({ message: "Invalid email" });
        return;
      }
      user = await User.findOne({ email });
      if (!user || user.deleted?.isDeleted) {
        res.status(401).json({ message: "Incorrect email, username or Passwort" });
        return;
      }
    } else if (username) {
      if (!validator.isAlphanumeric(username)) {
        res.status(401).json({ message: "Invalid username" });
        return;
      }
      user = await User.findOne({ username: username });
      if (!user || user.deleted?.isDeleted) {
        res.status(401).json({ message: "Incorrect email, username or Passwort" });
        return;
      }
    }

    const passwordMatch = await bcrypt.compare(password, user?.password as string);

    if (!passwordMatch) {
      res.status(400).json({ message: "Incorrect email, username or Passwort" });
      return;
    }

    const accessToken = jwt.sign({ id: user?._id }, process.env.JWT_SECRET as string, {
      expiresIn: JWT_ACCESS_EXPIRATION,
    });

    const refreshToken = jwt.sign({ id: user?._id }, process.env.JWT_SECRET as string, {
      expiresIn: JWT_REFRESH_EXPIRATION,
    });

    // Token an den User senden
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 60 * 60 * 1000, // 1 hour
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: remeberMe ? 7 * 24 * 60 * 60 * 1000 : 0, // 7 days or instant dead
    });

    res.json({
      message: "Login successful",
      user: { id: user?._id, email: user?.email, username: user?.username },
      token: accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error while login", error });
  }
};

/**
 * @desc Refresh the token
 * @route POST /user/refresh
 * @info besonderheit: die Id ist nicht notwendig, weil sie im Token ist => diese trotzdem nochmal abzufragen wäre ineffizient
 */

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    // token secure

    jwt.verify(refreshToken, process.env.JWT_SECRET as string, (err: any, decoded: any) => {
      if (err) {
        res.status(403).json({ message: "No Token provided" });
        return;
      }

      const accessToken = jwt.sign({ id: (decoded as { id: string }).id }, process.env.JWT_SECRET as string, {
        expiresIn: JWT_ACCESS_EXPIRATION,
      });

      res.json({ accessToken });
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error while refresh", err });
  }
};

/**
 * @desc Logout a user
 * @route POST /user/logout
 */

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/** 
 * @desc Deleting (Softdelete) a user
 * @route POST user/delete/:id

*/

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const VERIFYING = process.env.VERIFYING;

  try {
    const isHuman = VERIFYING === "true" ? await humanVerification(req.body.captchaToken) : true;
    if (!isHuman) {
      res.status(400).json({ message: "Captcha verification failed" });
      return;
    }

    let userId = req.params.id;
    userId = validator.escape(userId as string);

    let { reason } = req.body;
    reason = validator.escape(reason as string);

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
    let userId = req.params.id;
    userId = validator.escape(userId as string);

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "No user registered with this ID" });
      return;
    }

    if (!user.deleted?.isDeleted) {
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
