import { z } from "zod";

export const listGearSchema = z.object({
  query: z.object({
    category: z.string().optional(),
    brand: z.string().optional(),
    search: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    availability: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(10),
  }),
});

export type ListGearQuery = z.infer<typeof listGearSchema>["query"];
