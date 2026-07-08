import { Prisma } from "@prisma/client";
import prisma from "../../lib/prisma";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../errors";
import { CreateGearInput, UpdateGearInput } from "./provider-gear.validation";

class ProviderGearService {
  async create(providerId: string, input: CreateGearInput) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });
    if (!category) {
      throw new BadRequestError("The selected category does not exist");
    }

    return prisma.gearItem.create({
      data: {
        providerId,
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        brand: input.brand,
        pricePerDay: input.pricePerDay,
        condition: input.condition,
        stock: input.stock,
        availability: input.availability,
        images: input.images,
        ...(input.specifications !== undefined
          ? { specifications: input.specifications as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  async update(providerId: string, gearId: string, input: UpdateGearInput) {
    const gear = await prisma.gearItem.findUnique({ where: { id: gearId } });
    if (!gear) {
      throw new NotFoundError("Gear not found");
    }
    if (gear.providerId !== providerId) {
      throw new ForbiddenError("You can only manage your own gear");
    }

    if (input.categoryId && input.categoryId !== gear.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new BadRequestError("The selected category does not exist");
      }
    }

    return prisma.gearItem.update({
      where: { id: gearId },
      data: {
        categoryId: input.categoryId,
        name: input.name,
        description: input.description,
        brand: input.brand,
        pricePerDay: input.pricePerDay,
        condition: input.condition,
        stock: input.stock,
        availability: input.availability,
        images: input.images,
        ...(input.specifications !== undefined
          ? { specifications: input.specifications as Prisma.InputJsonValue }
          : {}),
      },
    });
  }

  async remove(providerId: string, gearId: string) {
    const gear = await prisma.gearItem.findUnique({
      where: { id: gearId },
      include: { _count: { select: { rentalOrders: true } } },
    });
    if (!gear) {
      throw new NotFoundError("Gear not found");
    }
    if (gear.providerId !== providerId) {
      throw new ForbiddenError("You can only manage your own gear");
    }
    if (gear._count.rentalOrders > 0) {
      throw new ConflictError("Cannot delete gear that has rental orders");
    }
    return prisma.gearItem.delete({ where: { id: gearId } });
  }
}

export const providerGearService = new ProviderGearService();
