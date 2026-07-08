import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("A valid email is required"),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters"),
    fullName: z
      .string({ required_error: "Full name is required" })
      .min(1, "Full name is required"),
    phone: z
      .string({ required_error: "Phone is required" })
      .min(6, "A valid phone number is required"),
    role: z.enum(["CUSTOMER", "PROVIDER"]).optional().default("CUSTOMER"),
    address: z.string().optional(),
    profilePicture: z
      .string()
      .url("Profile picture must be a valid URL")
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: "Email is required" })
      .email("A valid email is required"),
    password: z
      .string({ required_error: "Password is required" })
      .min(1, "Password is required"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
