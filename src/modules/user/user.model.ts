import bcrypt from "bcryptjs";
import crypto from "crypto";
import { InferSchemaType, Schema, Model, model } from "mongoose";

// 1. Define the interface for your custom methods
interface UserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
}

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Security: Never return password by default in queries
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  },
);

export type User = InferSchemaType<typeof UserSchema>;

UserSchema.methods.matchPassword = async function (
  this: User,
  enteredPassword: string,
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.createPasswordResetToken = function () {
  // A. Generate a random 32-byte hex string (The "Key")
  const resetToken = crypto.randomBytes(32).toString("hex");

  // B. Hash it and save to DB (Security: Never save plain tokens!)
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // C. Set expiration (10 minutes from now)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // D. Return the PLAIN token (to send in the email)
  return resetToken;
};

export const UserModel = model<User, Model<User, {}, UserMethods>>(
  "User",
  UserSchema,
);
