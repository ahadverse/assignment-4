import { PaymentStatus, RentalStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import stripe from "../../lib/stripe";
import { config } from "../../config";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { CreatePaymentInput } from "./payment.validation";

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
}

export const paymentService = new PaymentService();
