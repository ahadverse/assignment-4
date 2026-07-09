import { PaymentStatus, Prisma, RentalStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import {
  ListProviderOrdersQuery,
  UpdateOrderStatusInput,
} from "./provider-order.validation";

const allowedTransitions: Record<RentalStatus, RentalStatus[]> = {
  PLACED: [RentalStatus.CONFIRMED, RentalStatus.CANCELLED],
  CONFIRMED: [],
  PAID: [RentalStatus.PICKED_UP],
  PICKED_UP: [RentalStatus.RETURNED],
  CANCELLED: [],
  RETURNED: [],
};

class ProviderOrderService {
  async getProviderOrders(providerId: string, query: ListProviderOrdersQuery) {
    const { status, page, limit } = query;

    const where: Prisma.RentalOrderWhereInput = { providerId };
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

  async updateStatus(
    providerId: string,
    orderId: string,
    input: UpdateOrderStatusInput,
  ) {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundError("Rental order not found");
    }
    if (order.providerId !== providerId) {
      throw new ForbiddenError("You can only manage orders for your own gear");
    }

    const nextStatus = input.status;
    if (!allowedTransitions[order.status].includes(nextStatus)) {
      throw new BadRequestError(
        `Cannot change order status from ${order.status} to ${nextStatus}`,
      );
    }

    if (
      nextStatus === RentalStatus.PICKED_UP &&
      order.payment?.status !== PaymentStatus.COMPLETED
    ) {
      throw new BadRequestError("Order must be paid before it can be picked up");
    }

    return prisma.$transaction(async (tx) => {
      if (nextStatus === RentalStatus.CONFIRMED) {
        const gear = await tx.gearItem.findUnique({
          where: { id: order.gearId },
        });
        if (!gear || gear.stock < order.quantity) {
          throw new BadRequestError("Not enough stock to confirm this order");
        }
        await tx.gearItem.update({
          where: { id: order.gearId },
          data: { stock: { decrement: order.quantity } },
        });
      }

      if (nextStatus === RentalStatus.RETURNED) {
        await tx.gearItem.update({
          where: { id: order.gearId },
          data: { stock: { increment: order.quantity } },
        });
      }

      return tx.rentalOrder.update({
        where: { id: orderId },
        data: { status: nextStatus },
        include: {
          gear: { select: { id: true, name: true, brand: true, stock: true } },
          customer: { select: { id: true, fullName: true, email: true } },
          payment: { select: { id: true, status: true, amount: true } },
        },
      });
    });
  }
}

export const providerOrderService = new ProviderOrderService();
