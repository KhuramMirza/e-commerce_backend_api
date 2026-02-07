import { Router } from "express";
import * as UserController from "./user.controller.js";
import { validate } from "../../common/middleware/validate.js";
import {
  RegisterSchema,
  LoginSchema,
  UpdateMeSchema,
  UpdateMyPasswordSchema,
  ResetPasswordSchema,
} from "./user.schema.js";
import { protect } from "../../common/middleware/auth.middleware.js";

const router = Router();

// Endpoint: POST /api/v1/users/register
router.post(
  "/register",
  validate(RegisterSchema),
  UserController.registerHandler,
);

// Endpoint: POST /api/v1/users/login
router.post("/login", validate(LoginSchema), UserController.loginHandler);

// Endpoint: PATCH /api/v1/users/updateMe
router.patch(
  "/updateMe",
  protect,
  validate(UpdateMeSchema),
  UserController.updateMeHandler,
);

// Endpoint: PATCH /api/v1/users/updateMyPassword
router.patch(
  "/updateMyPassword",
  protect,
  validate(UpdateMyPasswordSchema),
  UserController.updateMyPasswordHandler,
);

// Endpoint: GET /api/v1/users/logout
router.get("/logout", UserController.logoutHandler);
export const userRoutes = router;

// Endpoint: POST /api/v1/users/forgotPassword
router.post("/forgotPassword", UserController.forgotPasswordHandler);

// Endpoint: PATCH /api/v1/users/resetPassword/:token
router.patch(
  "/resetPassword/:token",
  validate(ResetPasswordSchema),
  UserController.resetPasswordHandler,
);
