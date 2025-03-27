import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      match: /.+\@.+\..+/ 
    },
    password: { type: String, required: true, select: false },
    role: { 
      type: String, 
      enum: ["admin", "user", "customer", "moderator", "staff"], 
      default: "user" 
    },
    addresses: [
      {
        street: String,
        city: String,
        postalCode: String,
        country: String,
        isDefault: { type: Boolean, default: false },
      }
    ],
    phone: { type: String },
    orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
    profileImage: { type: String, default: "https://via.placeholder.com/150" },
    isActive: { type: Boolean, default: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    bio: { type: String, default: "" }, 
    birthDate: { type: Date },
    socialMedia: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      instagram: { type: String, default: "" }
    },
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
    }
  },
  { timestamps: true }
);

const User = model("User", userSchema);
export default User;
