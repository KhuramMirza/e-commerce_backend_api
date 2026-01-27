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
    price: z.coerce.number().positive("Price must be positive"),
    stock: z.coerce.number().positive("Stock must be positive").optional(),
    image: z.string().min(1, "Image URL is required"),
    sku: z.string().trim().min(3, "SKU must be at least 3 characters"),
    isActive: z.boolean().optional(),
  }),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>["body"];
