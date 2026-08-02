import { z } from "zod";

export const listGearSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    availability: z.enum(["true", "false"]).optional(),
    availableFrom: z.coerce.date().optional(),
    availableTo: z.coerce.date().optional(),
    sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export const gearAvailabilitySchema = z.object({
  query: z.object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
});

export type ListGearQuery = z.infer<typeof listGearSchema>["query"];
export type GearAvailabilityQuery = z.infer<
  typeof gearAvailabilitySchema
>["query"];
