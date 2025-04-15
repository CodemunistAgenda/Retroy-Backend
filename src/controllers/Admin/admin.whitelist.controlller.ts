import { type Request, type Response } from "express";
import WhiteList, { type WhiteListType } from "../../models/whileList.model";
import User, { type UserType } from "../../models/user.model";
import { errorResponse } from "../../utils/helper.function";

interface AdminAuth extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// WICHTIG die Whitelist darf nur mit einmal Passwort sichtbar sein (wird später sicher gestellt)
export const showWhiteList = async (req: AdminAuth, res: Response): Promise<void> => {
  console.log("Show whitelist");
  try {
    // das sollte die getters aktivieren macht es aber nicht
    const whitelist: WhiteListType[] = await WhiteList.find({}).select("username email password -_id");

    if (!whitelist || whitelist.length === 0) {
      return errorResponse(res, 404, "No whitelist found");
    }

    // hier werden die getter aktiviert (wir verwenden eine JS method die wird ohne any nicht von ts erkannt)
    const plain = whitelist.map((entry) => (entry as any).toObject({ getters: true }));

    res.status(200).json({ whitelist: plain });
  } catch (error) {
    res.status(500).json({ message: "Error fetching whitelist", error });
  }
};

export const deleteUserFromWhiteList = async (req: AdminAuth, res: Response): Promise<void> => {
  console.log("Delete user from whitelist");
  const { id } = req.params;

  if (!id) {
    return errorResponse(res, 400, "No id provided");
  }

  try {
    const user = await WhiteList.findByIdAndDelete(id);

    if (!user) {
      return errorResponse(res, 404, "No user with this id in whitelist");
    }

    res.status(200).json("User deleted from whitelist");
  } catch (e) {
    return errorResponse(res, 500, "Error deleting user from whitelist", e);
  }
};

// username und email müssen über den body geschickt werden um keinen id in die Whitelist zu geben
export const addUserToWhiteList = async (req: AdminAuth, res: Response): Promise<void> => {
  console.log("Add to whitelist");
  const { email, username } = req.body;

  if (!username || !email) {
    return errorResponse(res, 400, "No username or email provided");
  }

  try {
    const user = await User.findOne({ username, email });

    if (!user) {
      return errorResponse(res, 404, "No user with this username or email");
    }

    await WhiteList.create({
      email: user.email,
      username: user.username,
    });

    console.log("User added to whitelist");

    res.status(200).json({
      message: "User added to whitelist",
    });
  } catch {
    return errorResponse(res, 500, "Error adding user to whitelist");
  }
};
