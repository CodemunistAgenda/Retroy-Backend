import { type Request, type Response, type NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

import User, { type UserType } from "../models/user.model.ts";
import bcrypt from "bcryptjs";
import WhiteList, { type WhiteListType } from "../models/whileList.model.ts";
import { warningMail } from "./sendingMails.ts";
import { hulper } from "../utils/regex.ts";
import { errorResponse } from "../utils/helper.function.ts";

interface authRequest extends Request {
  user?: UserType;
}

export const adminAuth = async (req: authRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log("Admin auth middleware");
  const errorResponse = (status: number, message: string, err?: any) => {
    res.status(status).json({ message, error: err ? err.message : null });
  };
  // passwörter werden beim leerzeichen gespittet, passwörter selbst dürfen keine Leerzeichen haben
  const [password, adminPassword] = req.body.password.split(" ");
  const { username, email } = req.body;

  console.log(password);
  console.log(adminPassword);

  try {
    // ohne Admin Passwort, wird der normale Anmeldeprocess wetier gemacht
    if (!adminPassword || adminPassword.trim().length !== 20) {
      console.log("Admin password not found");
      return next();
    }

    console.log("Starting admin password check");
    // alle felder werden verlangt
    if (!password || !username || !email) {
      return errorResponse(400, "All frields are required");
    }

    console.log("all fields are filled");

    if (adminPassword) {
      console.log("Admin password found");
      // hier wird das password mit dem aus main.js und in regex.ts gespeicherten
      const valAdmin = bcrypt.compareSync(adminPassword, hulper);
      console.log("Admin password valid", valAdmin);
      if (valAdmin) {
        // zu erst muss der User gefunden werden
        console.log("Admin password is valid");
        const user = await User.findOne({ email });
        console.log("User found", user);
        if (!user) {
          errorResponse(404, "User not found");
          return;
        }

        // hier wird der User ansich validiert
        const match = bcrypt.compareSync(password, user.password);
        console.log("User password valid", match);
        if (!match) {
          // hier sollte ein Warnung an den Admin geschickt werden
          warningMail(
            "Warning: Possible password leak",
            `User ${user.username} tried to login with the admin password, but the password was wrong`
          );
          errorResponse(404, "User not found");
          return;
        }
        // hier wird nun gecheckt, ob der User in der Whitelist ist
        const white = await WhiteList.findOne({ username });

        if (white) {
          const fullWhite: WhiteListType = white.toObject({ getters: true });
        } else {
          // ist der User nicht in der Whitelist wird dieser sofort gelöscht
          console.log("User not in whitelist");
          user.deleted = {
            isDeleted: true,
            deletedAt: new Date(),
            reason: "Unauthorized access, known admin password",
            deletedBy: "System secure",
          };
          await user.save();
          errorResponse(404, "User not found");

          // hier muss der Admin benachrichtigt werden, das passwort wurde geleakt
          // erfolgreich mit sendGrid getestet
          warningMail(
            "Password is leaked, fast action required",
            `
              System reacted! User deleted\n
              User: ${user.username}\n
              Email: ${user.email}\n
              Unauthorized subject knows the admin password\n
              User deleted, but the password is still in the system\n
            `
          );
          console.log("sendet warning mail");
          return;
        }

        // Hidden path:
        // hier wird der User zum Admin bis dieser sich abmeldet oder offline geht
        user.role = "admin";

        // hier kann der Admin als User arbeiten, aber in den Handlungen wird nun gespeichert das er als Admin arbeitet
        // ich weiß nicht wie ich die Fehler meldung hier entfernen kann...
        req.user = user;
        req.user!._id = user.id;

        next();
      } else {
        // hier sollte nur eine Benachrichtigung an den Admin geschickt werden, um zu prüfen, ob es ein Fehler oder ein Leak war

        return next();
      }
    } else {
      // es kann auch ein fehler gewesen sein, in dem Fall wir die Middelware
      // für normale Passwörter den Fehler abfangen
      return next();
    }
  } catch (error) {
    errorResponse(500, "Internal server error", error);
    return;
  }
};

// überprüfen der Role zentral vor dem Admin Router

export const roleCheck = async (req: authRequest, res: Response, next: NextFunction): Promise<void> => {
  console.log("Role check middleware");

  console.log("User role", req.user?.role);

  const role = req.user?.role;
  if (!role) {
    console.warn("User role not found in roleCheck middleware");
    return errorResponse(res, 404, "User not found in request");
  }

  if (role !== "admin") {
    console.warn(`internal error, userrole reaches admin path: ${req.user?.username}, ${role}`);
    return errorResponse(res, 403, "Access denied");
  }

  console.log("Role check passed");
  return next();
};
