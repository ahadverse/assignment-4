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

export type CreateRentalInput = z.infer<typeof createRentalSchema>["body"];
