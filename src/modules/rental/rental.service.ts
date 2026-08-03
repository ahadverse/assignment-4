import { PaymentStatus, Prisma, RentalStatus, Role } from "@prisma/client";
import prisma from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateRentalInput, ListRentalsQuery } from "./rental.validation";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

class RentalService {
  async create(customerId: string, input: CreateRentalInput) {
    const { gearId, rentalStartDate, rentalEndDate, quantity } = input;

    if (rentalEndDate <= rentalStartDate) {
      throw new BadRequestError("Rental end date must be after the start date");
    }

    const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });
    if (!gear) {
      throw new NotFoundError("Gear not found");
    }
    if (!gear.availability) {
      throw new BadRequestError("This gear is not available for rent");
    }
    if (quantity > gear.stock) {
      throw new BadRequestError(
        `Only ${gear.stock} unit(s) of this gear are in stock`,
      );
    }

    const days = Math.ceil(
      (rentalEndDate.getTime() - rentalStartDate.getTime()) / MS_PER_DAY,
    );
    const totalAmount = Number(gear.pricePerDay) * quantity * days;

    return prisma.rentalOrder.create({
      data: {
        customerId,
        gearId: gear.id,
        providerId: gear.providerId,
        rentalStartDate,
        rentalEndDate,
        quantity,
        totalAmount,
        status: RentalStatus.PLACED,
      },
      include: {
        gear: {
          select: {
            id: true,
            name: true,
            brand: true,
            images: true,
            pricePerDay: true,
          },
        },
      },
    });
  }

  async getCustomerOrders(
    customerId: string,
    role: Role,
    query: ListRentalsQuery,
  ) {
    const { status, page, limit } = query;

    const where: Prisma.RentalOrderWhereInput =
      role === Role.ADMIN ? {} : { customerId };
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
          gear: {
            select: {
              id: true,
              name: true,
              brand: true,
              images: true,
              pricePerDay: true,
            },
          },
          provider: { select: { id: true, fullName: true } },
          payment: { select: { id: true, status: true, amount: true } },
          review: { select: { id: true, rating: true } },
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

  async getByIdForUser(userId: string, role: Role, orderId: string) {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
      include: {
        gear: {
          select: {
            id: true,
            name: true,
            brand: true,
            images: true,
            pricePerDay: true,
          },
        },
        customer: { select: { id: true, fullName: true, email: true } },
        provider: { select: { id: true, fullName: true, email: true } },
        payment: true,
        review: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Rental order not found");
    }

    const isOwner =
      order.customerId === userId || order.providerId === userId;
    if (role !== Role.ADMIN && !isOwner) {
      throw new ForbiddenError("You do not have access to this rental order");
    }

    return order;
  }

  async cancelOwnOrder(customerId: string, role: Role, orderId: string) {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError("Rental order not found");
    }
    if (role !== Role.ADMIN && order.customerId !== customerId) {
      throw new ForbiddenError("You can only cancel your own rental orders");
    }
    if (order.status !== RentalStatus.PLACED) {
      throw new BadRequestError(
        "Only orders that are still placed can be cancelled",
      );
    }

    await this.closeOpenCheckout(orderId);

    return prisma.rentalOrder.update({
      where: { id: orderId },
      data: { status: RentalStatus.CANCELLED },
      include: {
        gear: { select: { id: true, name: true, brand: true } },
      },
    });
  }

  private async closeOpenCheckout(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { rentalOrderId: orderId },
    });

    if (
      !payment?.transactionId ||
      payment.status !== PaymentStatus.PENDING
    ) {
      return;
    }

    const session = await stripe.checkout.sessions.retrieve(
      payment.transactionId,
    );

    if (session.payment_status === "paid") {
      throw new BadRequestError(
        "This booking has already been paid and can no longer be cancelled",
      );
    }

    if (session.status === "open") {
      await stripe.checkout.sessions.expire(payment.transactionId);
    }

    await prisma.payment.update({
      where: { rentalOrderId: orderId },
      data: { status: PaymentStatus.FAILED },
    });
  }
}

export const rentalService = new RentalService();
