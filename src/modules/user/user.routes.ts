import { Router } from "express";
import * as UserController from "./user.controller.js";
import { validate } from "../../common/middleware/validate.js";
import { RegisterSchema, LoginSchema } from "./user.schema.js";

const router = Router();

// Endpoint: POST /api/v1/users/register
router.post(
  "/register",
  validate(RegisterSchema),
  UserController.registerHandler,
);

// Endpoint: POST /api/v1/users/login
router.post("/login", validate(LoginSchema), UserController.loginHandler);

export const userRoutes = router;
