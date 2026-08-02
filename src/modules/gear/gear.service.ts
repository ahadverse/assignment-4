import { Prisma, RentalStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { NotFoundError } from "../../errors";
import { GearAvailabilityQuery, ListGearQuery } from "./gear.validation";

const ACTIVE_RENTAL_STATUSES: RentalStatus[] = [
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
];

class GearsService {
  async getAll(query: ListGearQuery) {
    const {
      category,
      brand,
      search,
      minPrice,
      maxPrice,
      availability,
      availableFrom,
      availableTo,
      sort,
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

    if (availableFrom && availableTo) {
      const bookedOut = await this.findBookedOutGearIds(
        availableFrom,
        availableTo,
      );
      if (bookedOut.length > 0) {
        where.id = { notIn: bookedOut };
      }
    }

    const orderBy: Prisma.GearItemOrderByWithRelationInput =
      sort === "price_asc"
        ? { pricePerDay: "asc" }
        : sort === "price_desc"
          ? { pricePerDay: "desc" }
          : { createdAt: "desc" };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.gearItem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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

  async getBrands() {
    const rows = await prisma.gearItem.findMany({
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    });

    return rows.map((row) => row.brand);
  }

  async getAvailability(gearId: string, query: GearAvailabilityQuery) {
    const gear = await prisma.gearItem.findUnique({
      where: { id: gearId },
      select: { id: true, stock: true, availability: true },
    });

    if (!gear) {
      throw new NotFoundError("Gear not found");
    }

    const { from, to } = query;

    const orders = await prisma.rentalOrder.findMany({
      where: {
        gearId,
        status: { in: ACTIVE_RENTAL_STATUSES },
        ...(from && to
          ? { rentalStartDate: { lte: to }, rentalEndDate: { gte: from } }
          : {}),
      },
      select: {
        rentalStartDate: true,
        rentalEndDate: true,
        quantity: true,
      },
      orderBy: { rentalStartDate: "asc" },
    });

    const reserved = orders.reduce((sum, order) => sum + order.quantity, 0);

    return {
      gearId,
      availability: gear.availability,
      stock: gear.stock,
      capacity: gear.stock + reserved,
      bookedRanges: orders.map((order) => ({
        from: order.rentalStartDate,
        to: order.rentalEndDate,
        quantity: order.quantity,
      })),
    };
  }

  private async findBookedOutGearIds(from: Date, to: Date) {
    const [allActive, windowActive] = await Promise.all([
      prisma.rentalOrder.groupBy({
        by: ["gearId"],
        where: { status: { in: ACTIVE_RENTAL_STATUSES } },
        _sum: { quantity: true },
      }),
      prisma.rentalOrder.groupBy({
        by: ["gearId"],
        where: {
          status: { in: ACTIVE_RENTAL_STATUSES },
          rentalStartDate: { lte: to },
          rentalEndDate: { gte: from },
        },
        _sum: { quantity: true },
      }),
    ]);

    const reservedTotal = new Map<string, number>();
    allActive.forEach((row) => {
      reservedTotal.set(row.gearId, row._sum.quantity ?? 0);
    });

    const reservedInWindow = new Map<string, number>();
    windowActive.forEach((row) => {
      reservedInWindow.set(row.gearId, row._sum.quantity ?? 0);
    });

    const gears = await prisma.gearItem.findMany({
      select: { id: true, stock: true },
    });

    return gears
      .filter((gear) => {
        const capacity = gear.stock + (reservedTotal.get(gear.id) ?? 0);
        const available = capacity - (reservedInWindow.get(gear.id) ?? 0);
        return available <= 0;
      })
      .map((gear) => gear.id);
  }
}

export const gearService = new GearsService();
