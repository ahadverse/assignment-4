import { z } from "zod";

export const createRentalSchema = z.object({
  body: z.object({
    gearId: z
      .string({ required_error: "Gear is required" })
      .min(1, "Gear is required"),
    rentalStartDate: z.coerce.date({
      required_error: "Rental start date is required",
      invalid_type_error: "Rental start date must be a valid date",
    }),
    rentalEndDate: z.coerce.date({
      required_error: "Rental end date is required",
      invalid_type_error: "Rental end date must be a valid date",
    }),
    quantity: z
      .number()
      .int()
      .positive("Quantity must be at least 1")
      .optional()
      .default(1),
  }),
});

export const listRentalsSchema = z.object({
  query: z.object({
    status: z
      .enum([
        "PLACED",
        "CONFIRMED",
        "CANCELLED",
        "PAID",
        "PICKED_UP",
        "RETURNED",
      ])
      .optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>["body"];
export type ListRentalsQuery = z.infer<typeof listRentalsSchema>["query"];
