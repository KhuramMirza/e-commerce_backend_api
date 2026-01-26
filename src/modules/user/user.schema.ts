import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Name should be at least 3 characters long")
      .max(100),
    email: z.email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password should be at least 8 characters long")
      .max(100),
    adminSecret: z.string().optional(),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string(),
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>["body"];
export type LoginInput = z.infer<typeof LoginSchema>["body"];
