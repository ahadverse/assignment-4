import {
  PaymentStatus,
  Prisma,
  RentalStatus,
  Role,
  UserStatus,
} from "@prisma/client";
import prisma from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../errors";
import { sanitizeUser } from "../../utils/sanitize-user";
import {
  ListGearQuery,
  ListRentalsQuery,
  ListUsersQuery,
  UpdateUserStatusInput,
} from "./admin.validation";

class AdminService {
  async getStats() {
    const [
      totalUsers,
      usersByRole,
      suspendedUsers,
      totalGear,
      activeGear,
      totalRentals,
      rentalsByStatus,
      revenue,
      totalCategories,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
      prisma.user.count({ where: { status: UserStatus.SUSPENDED } }),
      prisma.gearItem.count(),
      prisma.gearItem.count({ where: { availability: true } }),
      prisma.rentalOrder.count(),
      prisma.rentalOrder.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED },
      }),
      prisma.category.count(),
      prisma.rentalOrder.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          gear: { select: { id: true, name: true, images: true } },
          customer: { select: { id: true, fullName: true, email: true } },
          provider: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    const roleCounts = Object.values(Role).reduce<Record<string, number>>(
      (acc, role) => {
        acc[role] = 0;
        return acc;
      },
      {},
    );
    usersByRole.forEach((row) => {
      roleCounts[row.role] = row._count._all;
    });

    const statusCounts = Object.values(RentalStatus).reduce<
      Record<string, number>
    >((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});
    rentalsByStatus.forEach((row) => {
      statusCounts[row.status] = row._count._all;
    });

    return {
      totalUsers,
      suspendedUsers,
      activeUsers: totalUsers - suspendedUsers,
      usersByRole: roleCounts,
      totalGear,
      activeGear,
      totalCategories,
      totalRentals,
      rentalsByStatus: statusCounts,
      totalRevenue: Number(revenue._sum.amount ?? 0),
      recentOrders,
    };
  }

  async getUsers(query: ListUsersQuery) {
    const { role, status, search, page, limit } = query;

    const where: Prisma.UserWhereInput = {};
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items: users.map(sanitizeUser),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateUserStatus(userId: string, input: UpdateUserStatusInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    if (user.role === Role.ADMIN) {
      throw new BadRequestError("Admin accounts cannot be modified");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status: input.status },
    });

    return sanitizeUser(updated);
  }

  async getGear(query: ListGearQuery) {
    const { search, page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GearItemWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.gearItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          provider: { select: { id: true, fullName: true, email: true } },
          category: { select: { id: true, name: true } },
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

  async getRentals(query: ListRentalsQuery) {
    const { status, search, page, limit } = query;

    const where: Prisma.RentalOrderWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { gear: { name: { contains: search, mode: "insensitive" } } },
        { customer: { fullName: { contains: search, mode: "insensitive" } } },
        { customer: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.rentalOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          gear: {
            select: { id: true, name: true, brand: true, images: true },
          },
          customer: { select: { id: true, fullName: true, email: true } },
          provider: { select: { id: true, fullName: true, email: true } },
          payment: { select: { id: true, status: true, amount: true } },
        },
      }),
      prisma.rentalOrder.count({ where }),
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
}

export const adminService = new AdminService();
