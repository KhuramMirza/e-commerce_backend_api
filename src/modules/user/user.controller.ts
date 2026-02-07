import { Request, Response, NextFunction } from "express";
import * as UserService from "./user.service.js";
import {
  RegisterInput,
  LoginInput,
  UpdateMeInput,
  UpdateMyPasswordInput,
  ResetPasswordInput,
} from "./user.schema.js";
import { AppError } from "../../common/utils/AppError.js";
import { filterObj } from "./user.service.js";

// 1. Register Handler
export const registerHandler = async (
  req: Request<{}, {}, RegisterInput>,
  res: Response,
) => {
  const user = await UserService.registerUser(req.body);

  const userResponse = user.toObject();
  delete (userResponse as any).password; // Remove password before sending response

  res.status(201).json({
    success: true,
    data: userResponse,
  });
};

// 2. Login Handler
export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  const { user, token } = await UserService.loginUser(req.body);

  res.status(200).json({
    success: true,
    token,
    data: user,
  });
};

// 3. Update Me Handler
export const updateMeHandler = async (
  req: Request<{}, {}, UpdateMeInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);

    // 1. Filter out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(req.body, "name", "email");
    // Note: If you add 'image' upload later, add 'image' here too.

    // 2. Update user
    const updatedUser = await UserService.updateMe(req.user.id, filteredBody);

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update My Password Handler
export const updateMyPasswordHandler = async (
  req: Request<{}, {}, UpdateMyPasswordInput>,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("Not authenticated", 401);

    // 1. Filter out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(
      req.body,
      "passwordCurrent",
      "passwordNew",
      "passwordConfirm",
    );

    // 2. Update password
    await UserService.updateMyPassword(req.user.id, filteredBody);

    res.status(200).json({
      success: true,
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
};

// 5. Logout Handler
export const logoutHandler = (req: Request, res: Response) => {
  // 1. Clear the cookie (if used)
  // We replace the JWT with 'loggedout' and set expiration to effectively immediately (10ms)
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  // 2. Send success response
  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

// 6. Forgot Password Handler
export const forgotPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Delegate business logic to Service
    await UserService.forgotPassword(req.body.email);

    // 2. Send Response
    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    next(error);
  }
};

// 7. Reset Password Handler
export const resetPasswordHandler = async (
  req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Reset the password
    const user = await UserService.resetPassword(
      req.params.token,
      req.body.password,
    );

    // 2. Log them in immediately (Generate JWT)
    // Note: You might need to export your 'signToken' helper from auth.controller or service
    // For now, I'll assume you can import `signToken` or duplicate the logic briefly.

    // const token = signToken(user._id);
    // ^^^ You need to make sure your signToken function is exported/available!

    res.status(200).json({
      status: "success",
      message: "Password reset successful! You are now logged in.",
      // token, // Uncomment when you have the token logic ready
    });
  } catch (error) {
    next(error);
  }
};
