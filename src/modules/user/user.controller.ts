import { Request, Response } from "express";
import * as UserService from "./user.service.js";
import { RegisterInput, LoginInput } from "./user.schema.js";

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
