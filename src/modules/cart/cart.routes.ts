import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { AddToCartSchema } from "./cart.schema.js";
import * as CartController from "./cart.controller.js";

const router = Router();

// POST /api/v1/cart
router
  .route("/")
  .post(
    protect, // <--- Must be logged in
    validate(AddToCartSchema),
    CartController.addToCartHandler,
  )
  .get(
    protect, // <--- Must be logged in
    CartController.getCartHandler,
  );

router
  .route("/:productId")
  .delete(protect, CartController.removeFromCartHandler)
  .patch(protect, CartController.updateCartItemQuantityHandler);

export const cartRoutes = router;
