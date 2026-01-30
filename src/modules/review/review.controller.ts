import { Request, Response, NextFunction } from "express";
import * as ReviewService from "./review.service.js";

export const createReviewHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) throw new Error("User not found");

    const { productId } = req.params;

    const review = await ReviewService.createReview(
      req.user.id,
      productId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
