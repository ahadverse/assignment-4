import prisma from "../../lib/prisma";
import { ConflictError, NotFoundError } from "../../errors";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.validation";

class CategoryService {
  async getAll() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  }

  async create(input: CreateCategoryInput) {
    const existing = await prisma.category.findUnique({
      where: { name: input.name },
    });
    if (existing) {
      throw new ConflictError("A category with this name already exists");
    }
    return prisma.category.create({ data: input });
  }

  async update(id: string, input: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Category not found");
    }
    if (input.name && input.name !== existing.name) {
      const duplicate = await prisma.category.findUnique({
        where: { name: input.name },
      });
      if (duplicate) {
        throw new ConflictError("A category with this name already exists");
      }
    }
    return prisma.category.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    const existing = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { gearItems: true } } },
    });
    if (!existing) {
      throw new NotFoundError("Category not found");
    }
    if (existing._count.gearItems > 0) {
      throw new ConflictError(
        "Cannot delete a category that still has gear items",
      );
    }
    return prisma.category.delete({ where: { id } });
  }
}

export const categoryService = new CategoryService();
