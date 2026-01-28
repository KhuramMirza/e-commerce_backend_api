import { Request, Response, NextFunction } from "express";
import * as CartService from "./cart.service.js";
import { AppError } from "../../common/utils/AppError.js"; // Import AppError
import { ca } from "zod/locales";

export const addToCartHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🛡️ THE FIX: Explicitly check if user exists
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    // Now TypeScript knows req.user is definitely defined below here
    const userId = req.user.id;

    const cart = await CartService.addToCart(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const getCartHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("User not authenticated", 401);

    const cart = await CartService.getCart(req.user.id);

    // If no cart exists, we can return an empty structure instead of 404
    // This is nicer for the Frontend
    const safeCart = cart || { items: [], totalPrice: 0 };

    res.status(200).json({
      success: true,
      data: safeCart,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCartHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("User not authenticated", 401);

    // Get productId from the URL params (:productId)
    const { productId } = req.params;

    const cart = await CartService.removeFromCart(req.user.id, productId);

    res.status(200).json({
      success: true,
      message: "Item removed",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new AppError("User not authenticated", 401);

    const { productId } = req.params;

    const cart = await CartService.updateCartItemQuantity(
      req.user.id,
      productId,
      req.body.quantity,
    );

    res.status(200).json({
      success: true,
      message: "Cart updated",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
