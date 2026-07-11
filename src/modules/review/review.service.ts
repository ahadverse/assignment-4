import { Prisma, RentalStatus, Role } from "@prisma/client";
import prisma from "../../lib/prisma";
import { BadRequestError, ForbiddenError, NotFoundError } from "../../errors";
import { CreateReviewInput, ListReviewsQuery } from "./review.validation";

const REVIEWABLE_STATUSES: RentalStatus[] = [
  RentalStatus.PAID,
  RentalStatus.RETURNED,
];

class ReviewService {
  async create(customerId: string, role: Role, input: CreateReviewInput) {
    const order = await prisma.rentalOrder.findUnique({
      where: { id: input.rentalOrderId },
      include: { review: true },
    });

    if (!order) {
      throw new NotFoundError("Rental order not found");
    }
    if (role !== Role.ADMIN && order.customerId !== customerId) {
      throw new ForbiddenError("You can only review your own rentals");
    }
    if (!REVIEWABLE_STATUSES.includes(order.status)) {
      throw new BadRequestError("You can only review paid or returned rentals");
    }
    if (order.review) {
      throw new BadRequestError("You have already reviewed this rental");
    }

    return prisma.review.create({
      data: {
        gearId: order.gearId,
        customerId: order.customerId,
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
