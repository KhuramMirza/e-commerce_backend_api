import { ReviewModel } from "./review.model.js";
import { CreateReviewInput } from "./review.schema.js";
import { OrderModel } from "../order/order.model.js"; // You need this for the challenge!
import { AppError } from "../../common/utils/AppError.js";

export const createReview = async (
  userId: string,
  productId: string,
  data: CreateReviewInput,
) => {
  // 1. Search the 'Order' collection to get valid user who actually bought the product.
  const hasPurchased = await OrderModel.findOne({
    user: userId,
    // "items.product": productId,
    items: {
      $elemMatch: { product: productId },
    },
    status: "delivered",
  });

  if (!hasPurchased) {
    throw new AppError(
      "You can only review products that have been delivered to you.",
      403,
    );
  }

  // 2. If valid, proceed to create the review
  return await ReviewModel.create({
    user: userId,
    product: productId,
    review: data.review,
    rating: data.rating,
  });
};
