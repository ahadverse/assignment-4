import { RentalStatus } from "@prisma/client";
import prisma from "../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../errors";
import { CreateRentalInput } from "./rental.validation";

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
        gear: { select: { id: true, name: true, pricePerDay: true } },
      },
    });
  }
}

export const rentalService = new RentalService();
