import { z } from "zod";

export const listProviderOrdersSchema = z.object({
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

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "CANCELLED", "PICKED_UP", "RETURNED"], {
      required_error: "Status required",
    }),
  }),
});

export type ListProviderOrdersQuery = z.infer<
  typeof listProviderOrdersSchema
>["query"];
export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>["body"];
