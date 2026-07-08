import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name cannot be empty").optional(),
    phone: z.string().min(6, "A valid phone number is required").optional(),
    address: z.string().optional(),
    profilePicture: z
      .string()
      .url("Profile pictare must be a valid URL")
      .optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
