import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Category name is required" })
      .min(1, "Category name is required"),
    description: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name cannot be empty").optional(),
    description: z.string().optional(),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
