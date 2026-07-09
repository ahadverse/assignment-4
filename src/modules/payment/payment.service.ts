import Stripe from "stripe";
import { PaymentStatus, Prisma, RentalStatus, Role } from "@prisma/client";
import prisma from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { config } from "../../config";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import {
  CreatePaymentInput,
  ListPaymentsQuery,
} from "./payment.validation";

class PaymentService {
  async createCheckoutSession(customerId: string, input: CreatePaymentInput) {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: input.rentalOrderId },
      include: {
        gear: { select: { name: true } },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError("Rental order not found");
    }
    if (order.customerId !== customerId) {
      throw new ForbiddenError("You can only pay for your own orders");
    }
    if (order.status !== RentalStatus.CONFIRMED) {
      throw new BadRequestError("Only confirmed orders can be paid");
    }
    if (order.payment && order.payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestError("This order has already been paid");
    }

    const amount = Number(order.totalAmount);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: order.gear.name },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: config.stripe.successUrl,
      cancel_url: config.stripe.cancelUrl,
      metadata: {
        rentalOrderId: order.id,
        customerId,
      },
    });

    const payment = await prisma.payment.upsert({
      where: { rentalOrderId: order.id },
      create: {
        rentalOrderId: order.id,
        customerId,
        amount,
        currency: "usd",
        transactionId: session.id,
        status: PaymentStatus.PENDING,
      },
      update: {
        amount,
        transactionId: session.id,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: session.url,
    };
  }

  constructEvent(payload: Buffer, signature: string | undefined): Stripe.Event {
    const secret = config.stripe.webhookSecret;
    if (secret) {
      if (!signature) {
        throw new BadRequestError("Missing Stripe signature");
      }
      try {
        return stripe.webhooks.constructEvent(payload, signature, secret);
      } catch (error) {
        throw new BadRequestError("Invalid Stripe signature");
      }
    }
    return JSON.parse(payload.toString()) as Stripe.Event;
  }

  async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const rentalOrderId = session.metadata?.rentalOrderId;
      if (rentalOrderId) {
        await this.markPaymentCompleted(rentalOrderId);
      }
    }
  }

  async getCustomerPayments(customerId: string, query: ListPaymentsQuery) {
    const { status, page, limit } = query;

    const where: Prisma.PaymentWhereInput = { customerId };
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          rentalOrder: {
            select: {
              id: true,
              status: true,
              gear: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
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

  async getPaymentById(userId: string, role: Role, paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        rentalOrder: {
          select: {
            id: true,
            status: true,
            gear: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    if (role !== Role.ADMIN && payment.customerId !== userId) {
      throw new ForbiddenError("You do not have access to this payment");
    }

    return payment;
  }

  private async markPaymentCompleted(rentalOrderId: string) {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: rentalOrderId },
      include: { payment: true },
    });

    if (!order || !order.payment) {
      return;
    }
    if (order.payment.status === PaymentStatus.COMPLETED) {
      return;
    }
    if (order.status !== RentalStatus.CONFIRMED) {
      return;
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { rentalOrderId },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
      }),
      prisma.rentalOrder.update({
        where: { id: rentalOrderId },
        data: { status: RentalStatus.PAID },
      }),
    ]);
  }
}

export const paymentService = new PaymentService();
