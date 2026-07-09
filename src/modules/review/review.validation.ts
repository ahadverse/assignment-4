import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rentalOrderId: z
      .string({ required_error: "Rental order is required" })
      .min(1, "Rental order is required"),
    rating: z
      .number({ required_error: "Rating is required" })
      .int()
      .min(1, "Rating must be between 1 and 5")
      .max(5, "Rating must be between 1 and 5"),
    reviewText: z
      .string({ required_error: "Review text is required" })
      .min(1, "Review text is required"),
  }),
});

export const listReviewsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
export type ListReviewsQuery = z.infer<typeof listReviewsSchema>["query"];
