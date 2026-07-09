import bcrypt from "bcryptjs";
import { Condition, PrismaClient, Role } from "@prisma/client";

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

  for (const gear of sampleGear) {
    const providerId = providerIds[gear.providerIndex];
    const existing = await prisma.gearItem.findFirst({
      where: { providerId, name: gear.name },
    });
    if (!existing) {
      await prisma.gearItem.create({
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
  }

  console.log("Seed complete");
  console.log("Admin email:", admin.email);
  console.log("Admin password:", adminPassword);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
