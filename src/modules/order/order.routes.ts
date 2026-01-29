import { Router } from "express";
import { adminOnly, protect } from "../../common/middleware/auth.middleware.js";
import { validate } from "../../common/middleware/validate.js";
import { CreateOrderSchema, UpdateStatusSchema } from "./order.schema.js";
import * as OrderController from "./order.controller.js";

const router = Router();

router.get("/my-orders", protect, OrderController.getMyOrdersHandler);

router.patch(
  "/:orderId/status",
  protect,
  adminOnly,
  validate(UpdateStatusSchema),
  OrderController.updateOrderStatusHandler,
);

router
  .route("/")
  .post(
    protect,
    validate(CreateOrderSchema),
    OrderController.createOrderHandler,
  )
  .get(protect, adminOnly, OrderController.getAllOrdersHandler);

export const orderRoutes = router;
