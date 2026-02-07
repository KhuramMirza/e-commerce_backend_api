import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../../common/utils/email.js";
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

// 1. Reset Password
export const resetPassword = async (token: string, newPassword: string) => {
  // 1. Hash the token from the URL so we can compare it to the DB
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // 2. Find user with this token AND make sure it hasn't expired ($gt = greater than now)
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Token is invalid or has expired", 400);
  }

  // 3. Set the new password
  user.password = bcrypt.hashSync(newPassword, 10) as any; // Hash the new password before saving

  // 4. Clear the reset fields (Token is single-use!)
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 5. Save (Triggers pre-save hook to hash the new password)
  await user.save();

  return user;
};

// 2. Forgot Password
export const forgotPassword = async (email: string) => {
  // 1. Find the User
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError("There is no user with that email address.", 404);
  }

  // 2. Generate the random reset token (Model method)
  const resetToken = user.createPasswordResetToken();

  // 3. Save it to DB (Crucial: turn off validation for other fields)
  await user.save({ validateBeforeSave: false });

  // 4. Send Email
  // We need to construct the URL here or pass it in.
  // For a clean service, let's just return the token and let Controller handle the URL construction
  // OR handle the email sending right here if we pass the 'origin'.
  // Let's keep it simple: Service handles EVERYTHING including email.

  const resetURL = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`;
  // Note: Better to use env var for frontend URL than req.protocol in service

  const message = `Forgot your password? Submit a PATCH request with your new password to: \n\n ${resetURL} \n\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Token (Valid for 10 min)",
      message,
    });
  } catch (err) {
    // Rollback if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      "There was an error sending the email. Try again later!",
      500,
    );
  }
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
