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

export const UpdateMeSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(3, "Name should be at least 3 characters long")
        .max(100, "Name should be at most 100 characters long")
        .optional(),
      email: z.email("Invalid email address").optional(),
    })
    .strict(),
});

export const UpdateMyPasswordSchema = z.object({
  body: z
    .object({
      passwordCurrent: z.string().min(8, "Current password is required"),
      passwordConfirm: z.string().min(8, "Password confirmation is required"),
      passwordNew: z
        .string()
        .min(8, "New password should be at least 8 characters long"),
    })
    .refine((data) => data.passwordConfirm === data.passwordNew, {
      message: "New password and confirmation do not match",
      path: ["passwordConfirm"],
    }),
});

export const ResetPasswordSchema = z.object({
  params: z.object({
    token: z.string(),
  }),
  body: z
    .object({
      password: z.string().min(8, "Password must be at least 8 characters"),
      passwordConfirm: z.string().min(8, "Please confirm your password"),
    })
    .refine((data) => data.password === data.passwordConfirm, {
      message: "Passwords do not match",
      path: ["passwordConfirm"],
    }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>["body"];
export type LoginInput = z.infer<typeof LoginSchema>["body"];
export type UpdateMeInput = z.infer<typeof UpdateMeSchema>["body"];
export type UpdateMyPasswordInput = z.infer<
  typeof UpdateMyPasswordSchema
>["body"];
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
