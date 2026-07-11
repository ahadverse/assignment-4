import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import { NotFoundError } from "../../errors";
import { ListGearQuery } from "./gear.validation";

class GearsService {
  async getAll(query: ListGearQuery) {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      availability,
      page,
      limit,
    } = query;

    const where: Prisma.GearItemWhereInput = {};

    if (category) {
      where.category = {
        OR: [
          { id: category },
          { name: { equals: category, mode: "insensitive" } },
        ],
      };
    }
    if (brand) {
      where.brand = { contains: brand, mode: "insensitive" };
    }
    if (availability !== undefined) {
      where.availability = availability === "true";
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerDay = {
        ...(minPrice !== undefined ? { gte: minPrice } : {}),
        ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
      };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.gearItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          provider: { select: { id: true, fullName: true } },
        },
      }),
      prisma.gearItem.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const gear = await prisma.gearItem.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        provider: { select: { id: true, fullName: true, email: true } },
        reviews: {
          include: { customer: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!gear) {
      throw new NotFoundError("Gear not found");
    }

    return gear;
  }
}

export const gearService = new GearsService();
