import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    rentalOrderId: z
      .string({ required_error: "Rental order is required" })
      .min(1, "Rental order is required"),
  }),
});

export const confirmPaymentSchema = z.object({
  body: z.object({
    rentalOrderId: z
      .string({ required_error: "Rental order is required" })
      .min(1, "Rental order is required"),
  }),
});

export const listPaymentsSchema = z.object({
  query: z.object({
    status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>["body"];
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>["body"];
export type ListPaymentsQuery = z.infer<typeof listPaymentsSchema>["query"];
