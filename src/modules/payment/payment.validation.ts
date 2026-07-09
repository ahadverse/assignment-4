import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    rentalOrderId: z
      .string({ required_error: "Rental order is required" })
      .min(1, "Rental order is required"),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>["body"];
