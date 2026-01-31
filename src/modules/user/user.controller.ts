import { Request, Response, NextFunction } from "express";
import * as UserService from "./user.service.js";
import {
  RegisterInput,
  LoginInput,
  UpdateMeInput,
  UpdateMyPasswordInput,
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
