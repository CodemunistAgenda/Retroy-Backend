import { type UserType } from "../../models/user.model";

declare global {
  namespace Espress {
    interface Request {
      user: UserType;
    }
  }
}

// wichitg das hier ist nur vorrübergehend!!!
