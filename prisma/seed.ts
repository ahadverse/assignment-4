import bcrypt from "bcryptjs";
import {
  Condition,
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
  RentalStatus,
  Role,
} from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || "admin@gearup.com";
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;

const categoryNames = ["Cycling", "Camping", "Fitness", "Water Sports"];

const providers = [
  {
    email: "peakgear@gearup.com",
    fullName: "Peak Gear Rentals",
    phone: "0111111111",
  },
  {
    email: "riverside@gearup.com",
    fullName: "Riverside Outfitters",
    phone: "0122222222",
  },
];

const customers = [
  {
    email: "alex.customer@gearup.com",
    fullName: "Alex Customer",
    phone: "0133333001",
  },
  {
    email: "jamie.customer@gearup.com",
    fullName: "Jamie Customer",
    phone: "0133333002",
  },
  {
    email: "sam.customer@gearup.com",
    fullName: "Sam Customer",
    phone: "0133333003",
  },
  {
    email: "emma.customer@gearup.com",
    fullName: "Emma Customer",
    phone: "0133333004",
  },
  {
    email: "chris.customer@gearup.com",
    fullName: "Chris Customer",
    phone: "0133333005",
  },
];

type SampleGear = {
  providerIndex: number;
  category: string;
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  condition: Condition;
  stock: number;
};

const sampleGear: SampleGear[] = [
  {
    providerIndex: 0,
    category: "Cycling",
    name: "Mountain Bike",
    description: "27.5 inch hardtail mountain bike for trails and rough terrain.",
    brand: "Trek",
    pricePerDay: 25,
    condition: Condition.GOOD,
    stock: 4,
  },
  {
    providerIndex: 0,
    category: "Fitness",
    name: "Adjustable Dumbbell Set",
    description: "Pair of adjustable dumbbells from 5 to 25 kg.",
    brand: "Bowflex",
    pricePerDay: 8,
    condition: Condition.NEW,
    stock: 10,
  },
  {
    providerIndex: 1,
    category: "Camping",
    name: "4 Person Tent",
    description: "Waterproof dome tent that sleeps four people.",
    brand: "Coleman",
    pricePerDay: 15,
    condition: Condition.GOOD,
    stock: 6,
  },
  {
    providerIndex: 1,
    category: "Water Sports",
    name: "Kayak",
    description: "Single seat sit-on-top kayak with paddle included.",
    brand: "Perception",
    pricePerDay: 20,
    condition: Condition.FAIR,
    stock: 3,
  },
  {
    providerIndex: 1,
    category: "Camping",
    name: "Camping Stove",
    description: "Portable two burner propane camping stove.",
    brand: "Coleman",
    pricePerDay: 6,
    condition: Condition.GOOD,
    stock: 8,
  },
];

type SampleOrder = {
  customerIndex: number;
  gearName: string;
  quantity: number;
  rentalStartDate: Date;
  rentalEndDate: Date;
  status: RentalStatus;
  totalAmount: number;
  payment?: {
    transactionId: string;
    status: PaymentStatus;
    paidAt: Date;
  };
  review?: {
    rating: number;
    reviewText: string;
  };
};

const stockHeldStatuses: RentalStatus[] = [
  RentalStatus.CONFIRMED,
  RentalStatus.PAID,
  RentalStatus.PICKED_UP,
];

const sampleOrders: SampleOrder[] = [
  {
    customerIndex: 0,
    gearName: "Mountain Bike",
    quantity: 1,
    rentalStartDate: new Date("2026-07-15T00:00:00.000Z"),
    rentalEndDate: new Date("2026-07-18T00:00:00.000Z"),
    status: RentalStatus.PLACED,
    totalAmount: 75,
  },
  {
    customerIndex: 1,
    gearName: "Adjustable Dumbbell Set",
    quantity: 1,
    rentalStartDate: new Date("2026-07-12T00:00:00.000Z"),
    rentalEndDate: new Date("2026-07-19T00:00:00.000Z"),
    status: RentalStatus.CONFIRMED,
    totalAmount: 56,
  },
  {
    customerIndex: 2,
    gearName: "4 Person Tent",
    quantity: 1,
    rentalStartDate: new Date("2026-07-10T00:00:00.000Z"),
    rentalEndDate: new Date("2026-07-13T00:00:00.000Z"),
    status: RentalStatus.CANCELLED,
    totalAmount: 45,
  },
  {
    customerIndex: 0,
    gearName: "Kayak",
    quantity: 1,
    rentalStartDate: new Date("2026-07-05T00:00:00.000Z"),
    rentalEndDate: new Date("2026-07-08T00:00:00.000Z"),
    status: RentalStatus.PAID,
    totalAmount: 60,
    payment: {
      transactionId: "seed_txn_kayak_paid",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-07-04T12:00:00.000Z"),
    },
  },
  {
    customerIndex: 1,
    gearName: "Camping Stove",
    quantity: 1,
    rentalStartDate: new Date("2026-07-01T00:00:00.000Z"),
    rentalEndDate: new Date("2026-07-04T00:00:00.000Z"),
    status: RentalStatus.PICKED_UP,
    totalAmount: 18,
    payment: {
      transactionId: "seed_txn_stove_pickedup",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-06-30T12:00:00.000Z"),
    },
  },
  {
    customerIndex: 2,
    gearName: "Mountain Bike",
    quantity: 1,
    rentalStartDate: new Date("2026-06-20T00:00:00.000Z"),
    rentalEndDate: new Date("2026-06-23T00:00:00.000Z"),
    status: RentalStatus.RETURNED,
    totalAmount: 75,
    payment: {
      transactionId: "seed_txn_bike_returned",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-06-19T12:00:00.000Z"),
    },
    review: {
      rating: 5,
      reviewText: "Great mountain bike, smooth ride on the trails!",
    },
  },
  {
    customerIndex: 3,
    gearName: "Adjustable Dumbbell Set",
    quantity: 1,
    rentalStartDate: new Date("2026-06-10T00:00:00.000Z"),
    rentalEndDate: new Date("2026-06-14T00:00:00.000Z"),
    status: RentalStatus.RETURNED,
    totalAmount: 32,
    payment: {
      transactionId: "seed_txn_dumbbell_returned",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-06-09T12:00:00.000Z"),
    },
    review: {
      rating: 4,
      reviewText: "Solid dumbbells, easy to adjust the weights.",
    },
  },
  {
    customerIndex: 4,
    gearName: "4 Person Tent",
    quantity: 1,
    rentalStartDate: new Date("2026-06-05T00:00:00.000Z"),
    rentalEndDate: new Date("2026-06-08T00:00:00.000Z"),
    status: RentalStatus.RETURNED,
    totalAmount: 45,
    payment: {
      transactionId: "seed_txn_tent_returned",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-06-04T12:00:00.000Z"),
    },
    review: {
      rating: 4,
      reviewText: "Kept us dry through a rainy weekend.",
    },
  },
  {
    customerIndex: 3,
    gearName: "Kayak",
    quantity: 1,
    rentalStartDate: new Date("2026-06-15T00:00:00.000Z"),
    rentalEndDate: new Date("2026-06-17T00:00:00.000Z"),
    status: RentalStatus.RETURNED,
    totalAmount: 40,
    payment: {
      transactionId: "seed_txn_kayak_returned",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-06-14T12:00:00.000Z"),
    },
    review: {
      rating: 5,
      reviewText: "Stable and fast, great for beginners.",
    },
  },
  {
    customerIndex: 4,
    gearName: "Camping Stove",
    quantity: 1,
    rentalStartDate: new Date("2026-06-01T00:00:00.000Z"),
    rentalEndDate: new Date("2026-06-06T00:00:00.000Z"),
    status: RentalStatus.RETURNED,
    totalAmount: 30,
    payment: {
      transactionId: "seed_txn_stove_returned",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-05-31T12:00:00.000Z"),
    },
    review: {
      rating: 3,
      reviewText: "Works fine but takes a while to boil water.",
    },
  },
  {
    customerIndex: 3,
    gearName: "Mountain Bike",
    quantity: 1,
    rentalStartDate: new Date("2026-06-25T00:00:00.000Z"),
    rentalEndDate: new Date("2026-06-28T00:00:00.000Z"),
    status: RentalStatus.RETURNED,
    totalAmount: 75,
    payment: {
      transactionId: "seed_txn_bike_returned_2",
      status: PaymentStatus.COMPLETED,
      paidAt: new Date("2026-06-24T12:00:00.000Z"),
    },
    review: {
      rating: 4,
      reviewText: "Comfortable ride, brakes could be a bit sharper.",
    },
  },
];

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, saltRounds),
      fullName: "GearUp Admin",
      phone: "0000000000",
      role: Role.ADMIN,
    },
  });

  const categoryIds: Record<string, string> = {};
  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categoryIds[name] = category.id;
  }

  const providerPassword = await bcrypt.hash("Provider@1234", saltRounds);
  const providerIds: string[] = [];
  for (const provider of providers) {
    const created = await prisma.user.upsert({
      where: { email: provider.email },
      update: {},
      create: {
        email: provider.email,
        password: providerPassword,
        fullName: provider.fullName,
        phone: provider.phone,
        role: Role.PROVIDER,
      },
    });
    providerIds.push(created.id);
  }

  const gearIds: Record<string, string> = {};
  for (const gear of sampleGear) {
    const providerId = providerIds[gear.providerIndex];
    let record = await prisma.gearItem.findFirst({
      where: { providerId, name: gear.name },
    });
    if (!record) {
      record = await prisma.gearItem.create({
        data: {
          providerId,
          categoryId: categoryIds[gear.category],
          name: gear.name,
          description: gear.description,
          brand: gear.brand,
          pricePerDay: gear.pricePerDay,
          condition: gear.condition,
          stock: gear.stock,
          availability: true,
          images: [],
        },
      });
    }
    gearIds[gear.name] = record.id;
  }

  const customerPassword = await bcrypt.hash("Customer@1234", saltRounds);
  const customerIds: string[] = [];
  for (const customer of customers) {
    const created = await prisma.user.upsert({
      where: { email: customer.email },
      update: {},
      create: {
        email: customer.email,
        password: customerPassword,
        fullName: customer.fullName,
        phone: customer.phone,
        role: Role.CUSTOMER,
      },
    });
    customerIds.push(created.id);
  }

  let ordersCreated = 0;
  for (const sample of sampleOrders) {
    const customerId = customerIds[sample.customerIndex];
    const gearId = gearIds[sample.gearName];

    const existingOrder = await prisma.rentalOrder.findFirst({
      where: { customerId, gearId, rentalStartDate: sample.rentalStartDate },
    });
    if (existingOrder) {
      continue;
    }

    const gear = await prisma.gearItem.findUniqueOrThrow({
      where: { id: gearId },
    });

    const order = await prisma.rentalOrder.create({
      data: {
        customerId,
        gearId,
        providerId: gear.providerId,
        rentalStartDate: sample.rentalStartDate,
        rentalEndDate: sample.rentalEndDate,
        quantity: sample.quantity,
        totalAmount: sample.totalAmount,
        status: sample.status,
      },
    });
    ordersCreated += 1;

    if (stockHeldStatuses.includes(sample.status)) {
      await prisma.gearItem.update({
        where: { id: gearId },
        data: { stock: { decrement: sample.quantity } },
      });
    }

    if (sample.payment) {
      await prisma.payment.create({
        data: {
          rentalOrderId: order.id,
          customerId,
          amount: sample.totalAmount,
          currency: "usd",
          provider: PaymentProvider.STRIPE,
          transactionId: sample.payment.transactionId,
          status: sample.payment.status,
          paidAt: sample.payment.paidAt,
        },
      });
    }

    if (sample.review) {
      await prisma.review.create({
        data: {
          gearId,
          customerId,
          rentalOrderId: order.id,
          rating: sample.review.rating,
          reviewText: sample.review.reviewText,
        },
      });
    }
  }

  console.log("Seed complete");
  console.log("Admin email:", admin.email);
  console.log("Admin password:", adminPassword);
  console.log("Sample customer password:", "Customer@1234");
  console.log("Sample provider password:", "Provider@1234");
  console.log("Rental orders created this run:", ordersCreated);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
