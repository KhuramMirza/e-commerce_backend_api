import { Router } from "express";
import { protect } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { CreateReviewSchema } from "./review.schema.js";
import * as ReviewController from "./review.controller.js";

// ⚠️ IMPORTANT: mergeParams: true allows us to access :productId from the parent router
const router = Router({ mergeParams: true });

router.post(
  "/",
  protect,
  validate(CreateReviewSchema),
  ReviewController.createReviewHandler,
);

export const reviewRoutes = router;
