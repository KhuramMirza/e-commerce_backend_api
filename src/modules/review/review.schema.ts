import { z } from "zod";

export const CreateReviewSchema = z.object({
  body: z.object({
    review: z.string().min(10, "Review must be at least 10 characters"),
    rating: z.number().min(1).max(5),
  }),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>["body"];
