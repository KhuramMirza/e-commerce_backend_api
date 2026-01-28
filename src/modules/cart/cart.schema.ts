import { z } from "zod";

export const AddToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    quantity: z.number().min(1, "Quantity must be at least 1").optional(),
  }),
});

export type AddToCartInput = z.infer<typeof AddToCartSchema>["body"];
