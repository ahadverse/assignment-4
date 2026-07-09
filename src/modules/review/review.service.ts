import { Prisma, RentalStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateReviewInput, ListReviewsQuery } from "./review.validation";

class ReviewService {
  async create(customerId: string, input: CreateReviewInput) {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: input.rentalOrderId },
      include: { review: true },
    });

    if (!order) {
      throw new NotFoundError("Rental order not found");
    }
    if (order.customerId !== customerId) {
      throw new ForbiddenError("You can only review your own rentals");
    }
    if (order.status !== RentalStatus.RETURNED) {
      throw new BadRequestError("You can only review returned rentals");
    }
    if (order.review) {
      throw new BadRequestError("You have already reviewed this rental");
    }

    return prisma.review.create({
      data: {
        gearId: order.gearId,
        customerId,
        rentalOrderId: order.id,
        rating: input.rating,
        reviewText: input.reviewText,
      },
    });
  }

  async getGearReviews(gearId: string, query: ListReviewsQuery) {
    const { page, limit } = query;

    const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });
    if (!gear) {
      throw new NotFoundError("Gear not found");
    }

    const where: Prisma.ReviewWhereInput = { gearId };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, fullName: true } },
        },
      }),
      prisma.review.count({ where }),
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

export const reviewService = new ReviewService();
