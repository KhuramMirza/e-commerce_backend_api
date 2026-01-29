import { z } from "zod";

export const CreateOrderSchema = z.object({
  body: z.object({
    address: z.string().min(10, "Address must be at least 10 characters long"),
    paymentMethod: z.enum(["cash", "card"]).optional(),
  }),
});

export const UpdateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "paid", "shipped", "cancelled", "delivered"]),
  }),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>["body"];
