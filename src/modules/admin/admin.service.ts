import { Prisma, Role } from "@prisma/client";
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
  async getUsers(query: ListUsersQuery) {
    const { role, status, page, limit } = query;

    const where: Prisma.UserWhereInput = {};
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
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
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.gearItem.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          provider: { select: { id: true, fullName: true, email: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.gearItem.count(),
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
    const { status, page, limit } = query;

    const where: Prisma.RentalOrderWhereInput = {};
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.rentalOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          gear: { select: { id: true, name: true, brand: true } },
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
