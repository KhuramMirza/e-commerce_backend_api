import { z } from "zod";

export const CreateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Product name must be at least 3 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    price: z.number().positive("Price must be positive"),
    stock: z.number().positive("Stock must be positive").optional(),
    sku: z.string().trim().min(3, "SKU must be at least 3 characters"),
    isActive: z.boolean().optional(),
  }),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>["body"];
