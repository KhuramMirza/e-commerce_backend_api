import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel } from "./user.model.js";
import { RegisterInput, LoginInput } from "./user.schema.js";
import { AppError } from "../../common/utils/AppError.js";

// Helper: Only allow specific fields to be updated
export const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const updateMyPassword = async (userId: string, filteredBody: any) => {
  // 1. Find the User
  const user = await UserModel.findById(userId).select("+password");
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 2. Check if Posted current password is correct
  const isMatch = await user.matchPassword(filteredBody.passwordCurrent);

  if (!isMatch) {
    throw new AppError("Your current password is wrong.", 401);
  }

  // 3. If so, update password
  user.password = await bcrypt.hash(filteredBody.passwordNew, 10);
  await user.save();
};

export const updateMe = async (userId: string, filteredBody: any) => {
  // 1. Create error if user POSTs password data here
  if (filteredBody.password || filteredBody.passwordConfirm) {
    throw new AppError(
      "This route is not for password updates. Please use /updateMyPassword.",
      400,
    );
  }

  // 2. Update user document
  const updatedUser = await UserModel.findByIdAndUpdate(userId, filteredBody, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

export const registerUser = async (data: RegisterInput) => {
  console.log("login");
  const existingUser = await UserModel.findOne({ email: data.email });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  // Hashing the password before saving the user
  const hashedPassword = await bcrypt.hash(data.password, 10);

  let role = "user";
  if (data.adminSecret === process.env.ADMIN_SECRET) {
    role = "admin";
  }

  const user = await UserModel.create({
    ...data,
    password: hashedPassword,
    role,
  });
  return user;
};

export const loginUser = async (data: LoginInput) => {
  const user = await UserModel.findOne({ email: data.email }).select(
    "+password",
  );
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  user.password = undefined as any; // Remove password before returning user
  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || ("30d" as string),
    } as SignOptions,
  );

  return { user, token };
};
