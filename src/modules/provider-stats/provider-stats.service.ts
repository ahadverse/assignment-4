import { PaymentStatus, RentalStatus, Role } from "@prisma/client";
import prisma from "../../lib/prisma";

class ProviderStatsService {
  async getOverview(providerId: string, role: Role) {
    const gearWhere = role === Role.ADMIN ? {} : { providerId };
    const orderWhere = role === Role.ADMIN ? {} : { providerId };

    const [
      totalGear,
      activeGear,
      pendingOrders,
      activeRentals,
      totalOrders,
      grouped,
      revenue,
      recentOrders,
    ] = await Promise.all([
      prisma.gearItem.count({ where: gearWhere }),
      prisma.gearItem.count({ where: { ...gearWhere, availability: true } }),
      prisma.rentalOrder.count({
        where: { ...orderWhere, status: RentalStatus.PLACED },
      }),
      prisma.rentalOrder.count({
        where: {
          ...orderWhere,
          status: { in: [RentalStatus.PAID, RentalStatus.PICKED_UP] },
        },
      }),
      prisma.rentalOrder.count({ where: orderWhere }),
      prisma.rentalOrder.groupBy({
        by: ["status"],
        where: orderWhere,
        _count: { _all: true },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.COMPLETED,
          ...(role === Role.ADMIN ? {} : { rentalOrder: { providerId } }),
        },
      }),
      prisma.rentalOrder.findMany({
        where: orderWhere,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          gear: { select: { id: true, name: true, images: true } },
          customer: { select: { id: true, fullName: true, email: true } },
        },
      }),
    ]);

    return {
      totalGear,
      activeGear,
      pendingOrders,
      activeRentals,
      totalOrders,
      totalRevenue: Number(revenue._sum.amount ?? 0),
      ordersByStatus: this.toStatusMap(grouped),
      recentOrders,
    };
  }

  private toStatusMap(
    grouped: { status: RentalStatus; _count: { _all: number } }[],
  ) {
    const counts = Object.values(RentalStatus).reduce<Record<string, number>>(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {},
    );

    grouped.forEach((row) => {
      counts[row.status] = row._count._all;
    });

    return counts;
  }
}

export const providerStatsService = new ProviderStatsService();
