import { z } from "zod";

export const createGearSchema = z.object({
  body: z.object({
    categoryId: z
      .string({ required_error: "Category is required" })
      .min(1, "Category is required"),
    name: z
      .string({ required_error: "Gear name is required" })
      .min(1, "Gear name is required"),
    description: z
      .string({ required_error: "Description is required" })
      .min(1, "Description is required"),
    brand: z
      .string({ required_error: "Brand is required" })
      .min(1, "Brand is required"),
    pricePerDay: z
      .number({ required_error: "Price per day is required" })
      .positive("Price per day must be greater than 0"),
    condition: z.enum(["NEW", "GOOD", "FAIR"]).optional().default("GOOD"),
    specifications: z.record(z.any()).optional(),
    stock: z
      .number()
      .int()
      .nonnegative("Stock cannot be negative")
      .optional()
      .default(0),
    availability: z.boolean().optional().default(true),
    images: z
      .array(z.string().url("Each image must be a valid URL"))
      .optional()
      .default([]),
  }),
});

export const updateGearSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    brand: z.string().min(1).optional(),
    pricePerDay: z.number().positive("Price per day must be greater than 0").optional(),
    condition: z.enum(["NEW", "GOOD", "FAIR"]).optional(),
    specifications: z.record(z.any()).optional(),
    stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
    availability: z.boolean().optional(),
    images: z.array(z.string().url("Each image must be a valid URL")).optional(),
  }),
});

export type CreateGearInput = z.infer<typeof createGearSchema>["body"];
export type UpdateGearInput = z.infer<typeof updateGearSchema>["body"];
