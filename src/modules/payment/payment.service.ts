import Stripe from "stripe";
import {
  PaymentMethod,
  PaymentStatus,
  Prisma,
  RentalStatus,
  Role,
} from "@prisma/client";
import prisma from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { config } from "../../config";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import {
  CreatePaymentInput,
  ListPaymentsQuery,
} from "./payment.validation";

const PAYABLE_STATUSES: RentalStatus[] = [
  RentalStatus.PLACED,
  RentalStatus.CONFIRMED,
];

class PaymentService {
  async createCheckoutSession(
    customerId: string,
    role: Role,
    input: CreatePaymentInput,
  ) {
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
    if (role !== Role.ADMIN && order.customerId !== customerId) {
      throw new ForbiddenError("You can only pay for your own orders");
    }
    if (!PAYABLE_STATUSES.includes(order.status)) {
      throw new BadRequestError(
        "Only placed or confirmed orders can be paid",
      );
    }
    if (order.payment && order.payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestError("This order has already been paid");
    }

    const amount = Number(order.totalAmount);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "cashapp"],
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
      success_url: this.withParams(config.stripe.successUrl, {
        session_id: "{CHECKOUT_SESSION_ID}",
        orderId: order.id,
      }),
      cancel_url: this.withParams(config.stripe.cancelUrl, {
        orderId: order.id,
      }),
      metadata: {
        rentalOrderId: order.id,
        customerId: order.customerId,
      },
    });

    const payment = await prisma.payment.upsert({
      where: { rentalOrderId: order.id },
      create: {
        rentalOrderId: order.id,
        customerId: order.customerId,
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

  private withParams(baseUrl: string, params: Record<string, string>) {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const query = Object.entries(params)
      .map(([key, value]) =>
        value.startsWith("{") && value.endsWith("}")
          ? `${key}=${value}`
          : `${key}=${encodeURIComponent(value)}`,
      )
      .join("&");

    return `${baseUrl}${separator}${query}`;
  }

  constructEvent(payload: Buffer, signature: string | undefined): Stripe.Event {
    const secret = config.stripe.webhookSecret;
    if (!secret) {
      throw new BadRequestError("Webhook not configured");
    }
    if (!signature) {
      throw new BadRequestError("Missing Stripe signature");
    }
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      throw new BadRequestError("Invalid Stripe signature");
    }
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

  async getCustomerPayments(
    customerId: string,
    role: Role,
    query: ListPaymentsQuery,
  ) {
    const { status, method, page, limit } = query;

    const where: Prisma.PaymentWhereInput =
      role === Role.ADMIN ? {} : { customerId };
    if (status) {
      where.status = status;
    }
    if (method) {
      where.method = method;
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

  async confirmPayment(customerId: string, role: Role, rentalOrderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { rentalOrderId },
    });

    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    if (role !== Role.ADMIN && payment.customerId !== customerId) {
      throw new ForbiddenError("You can only confirm your own payments");
    }
    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }
    if (!payment.transactionId) {
      throw new BadRequestError("Payment not completed yet");
    }

    const session = await stripe.checkout.sessions.retrieve(
      payment.transactionId,
    );
    if (session.payment_status !== "paid") {
      throw new BadRequestError("Payment not completed yet");
    }

    await this.markPaymentCompleted(rentalOrderId);

    return prisma.payment.findUnique({ where: { rentalOrderId } });
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

  async markPaymentCompleted(rentalOrderId: string) {
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
    if (!PAYABLE_STATUSES.includes(order.status)) {
      return;
    }

    const method = await this.resolvePaymentMethod(
      order.payment.transactionId,
    );

    await prisma.$transaction([
      prisma.payment.update({
        where: { rentalOrderId },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date(), method },
      }),
      prisma.rentalOrder.update({
        where: { id: rentalOrderId },
        data: { status: RentalStatus.PAID },
      }),
    ]);
  }

  private async resolvePaymentMethod(
    transactionId: string | null,
  ): Promise<PaymentMethod | null> {
    if (!transactionId) {
      return null;
    }

    const session = await stripe.checkout.sessions.retrieve(transactionId, {
      expand: ["payment_intent.payment_method"],
    });

    const paymentIntent = session.payment_intent;
    const paymentMethod =
      typeof paymentIntent === "object" && paymentIntent
        ? paymentIntent.payment_method
        : null;
    const type =
      typeof paymentMethod === "object" && paymentMethod
        ? paymentMethod.type
        : undefined;

    if (type === "cashapp") {
      return PaymentMethod.CASHAPP;
    }
    if (type === "card") {
      return PaymentMethod.CARD;
    }
    return null;
  }
}

export const paymentService = new PaymentService();
