import { Request, Response, NextFunction } from "express";
import { AppError } from "../../common/utils/AppError.js";
import * as OrderService from "./order.service.js";
import * as PaymentService from "../payment/payment.service.js";

export const createOrderHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("User not authenticated", 401);

    // Call the service we wrote yesterday
    // It takes the userId and the shipping address (from body)
    const order = await OrderService.createOrder(req.user.id, req.body);

    let paymentUrl = "";

    if (order.paymentMethod === "card") {
      // Create a Stripe Checkout Session
      const session = await PaymentService.createCheckoutSession(order);
      paymentUrl = session.url as string;
    }

    // 3. Send Response
    // If it's Cash, paymentUrl is empty string.
    // If it's Card, the frontend will see paymentUrl and redirect the user there.
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
      paymentUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("User not authenticated", 401);

    const orders = await OrderService.getMyOrders(req.user.id);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const orders = await OrderService.getAllOrders();
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatusHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await OrderService.updateOrderStatus(orderId, status);

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
