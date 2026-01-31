import bcrypt from "bcryptjs";
import { InferSchemaType, Schema, Model, model } from "mongoose";

// 1. Define the interface for your custom methods
interface UserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
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

export const UserModel = model<User, Model<User, {}, UserMethods>>(
  "User",
  UserSchema,
);
