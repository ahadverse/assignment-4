import { z } from "zod";

export const listUsersSchema = z.object({
  query: z.object({
    role: z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]).optional(),
    status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], {
      required_error: "Status is required",
    }),
  }),
});

export const listGearSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
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
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];
export type UpdateUserStatusInput = z.infer<
  typeof updateUserStatusSchema
>["body"];
export type ListGearQuery = z.infer<typeof listGearSchema>["query"];
export type ListRentalsQuery = z.infer<typeof listRentalsSchema>["query"];
