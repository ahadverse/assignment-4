import bcrypt from "bcryptjs";
import {
  Condition,
  PaymentMethod,
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

const categoryNames = [
  "Cycling",
  "Camping",
  "Fitness",
  "Water Sports",
  "Climbing",
  "Winter Sports",
];

const categoryDescriptions: Record<string, string> = {
  Cycling: "Road, gravel, city and electric bikes for every ride",
  Camping: "Tents, sleeping gear and cookware for nights outdoors",
  Fitness: "Weights, mats and machines to train anywhere",
  "Water Sports": "Paddle, surf and dive equipment for open water",
  Climbing: "Ropes, harnesses and protection for rock and crag",
  "Winter Sports": "Skis, boards and snow safety kit for the mountains",
};

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
  {
    email: "summitsports@gearup.com",
    fullName: "Summit Sports Co",
    phone: "0133444555",
  },
  {
    email: "northside@gearup.com",
    fullName: "Northside Adventure Hire",
    phone: "0144555666",
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
  images: string[];
  specifications: Record<string, string>;
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const sampleGear: SampleGear[] = [
  {
    providerIndex: 0,
    category: "Cycling",
    name: "Mountain Bike",
    description: "27.5 inch hardtail mountain bike built for trails and rough terrain.",
    brand: "Trek",
    pricePerDay: 25,
    condition: Condition.GOOD,
    stock: 4,
    images: [unsplash("1576435728678-68d0fbf94e91"), unsplash("1485965120184-e220f721d03e")],
    specifications: {
      "Frame Size": "27.5 inch hardtail",
      "Gears": "21 speed",
      "Brakes": "Hydraulic disc",
      "Weight": "13.5 kg",
    },
  },

  {
    providerIndex: 0,
    category: "Cycling",
    name: "Road Racing Bike",
    description: "Lightweight carbon road bike for fast rides and long distances.",
    brand: "Specialized",
    pricePerDay: 30,
    condition: Condition.NEW,
    stock: 3,
    images: [unsplash("1485965120184-e220f721d03e"), unsplash("1576435728678-68d0fbf94e91")],
    specifications: {
      "Frame": "Carbon fibre",
      "Gears": "22 speed",
      "Brakes": "Rim caliper",
      "Weight": "8.2 kg",
    },
  },

  {
    providerIndex: 0,
    category: "Cycling",
    name: "City Commuter Bike",
    description: "Upright commuter with mudguards and a rear rack for daily riding.",
    brand: "Giant",
    pricePerDay: 18,
    condition: Condition.GOOD,
    stock: 6,
    images: [unsplash("1571333250630-f0230c320b6d"), unsplash("1485965120184-e220f721d03e")],
    specifications: {
      "Frame": "Aluminium",
      "Gears": "8 speed hub",
      "Extras": "Mudguards and rack",
      "Weight": "12.8 kg",
    },
  },

  {
    providerIndex: 2,
    category: "Cycling",
    name: "Gravel Adventure Bike",
    description: "Drop bar gravel bike with wide tyres for mixed surface touring.",
    brand: "Cannondale",
    pricePerDay: 32,
    condition: Condition.NEW,
    stock: 3,
    images: [unsplash("1576435728678-68d0fbf94e91"), unsplash("1571333250630-f0230c320b6d")],
    specifications: {
      "Frame": "Aluminium",
      "Tyres": "40mm gravel",
      "Gears": "11 speed",
      "Mounts": "Bikepacking ready",
    },
  },

  {
    providerIndex: 2,
    category: "Cycling",
    name: "Kids Mountain Bike",
    description: "24 inch wheel mountain bike sized for riders aged 8 to 12.",
    brand: "Trek",
    pricePerDay: 12,
    condition: Condition.GOOD,
    stock: 5,
    images: [unsplash("1571333250630-f0230c320b6d"), unsplash("1576435728678-68d0fbf94e91")],
    specifications: {
      "Wheel Size": "24 inch",
      "Gears": "7 speed",
      "Brakes": "V-brake",
      "Age Range": "8 to 12 years",
    },
  },

  {
    providerIndex: 3,
    category: "Cycling",
    name: "Electric City Bike",
    description: "Pedal assist e-bike with a 60km range for effortless commuting.",
    brand: "Giant",
    pricePerDay: 45,
    condition: Condition.NEW,
    stock: 2,
    images: [unsplash("1571333250630-f0230c320b6d"), unsplash("1485965120184-e220f721d03e")],
    specifications: {
      "Motor": "250W mid drive",
      "Battery": "500Wh",
      "Range": "Up to 60 km",
      "Assist": "4 levels",
    },
  },

  {
    providerIndex: 1,
    category: "Camping",
    name: "4 Person Tent",
    description: "Waterproof dome tent that comfortably sleeps four people.",
    brand: "Coleman",
    pricePerDay: 15,
    condition: Condition.GOOD,
    stock: 6,
    images: [unsplash("1504280390367-361c6d9f38f4"), unsplash("1526491109672-74740652b963")],
    specifications: {
      "Capacity": "4 people",
      "Water Resistance": "3000mm hydrostatic head",
      "Packed Weight": "4.2 kg",
      "Setup": "Dome pole, around 10 minutes",
    },
  },

  {
    providerIndex: 1,
    category: "Camping",
    name: "2 Person Backpacking Tent",
    description: "Ultralight two person tent that packs down small for trekking.",
    brand: "MSR",
    pricePerDay: 12,
    condition: Condition.NEW,
    stock: 8,
    images: [unsplash("1571687949921-1306bfb24b72"), unsplash("1510312305653-8ed496efae75")],
    specifications: {
      "Capacity": "2 people",
      "Packed Weight": "1.7 kg",
      "Season": "3 season",
      "Poles": "Aluminium",
    },
  },

  {
    providerIndex: 1,
    category: "Camping",
    name: "Camping Stove",
    description: "Portable two burner propane stove with wind shields.",
    brand: "Coleman",
    pricePerDay: 6,
    condition: Condition.GOOD,
    stock: 8,
    images: [unsplash("1523987355523-c7b5b0dd90a7"), unsplash("1526491109672-74740652b963")],
    specifications: {
      "Burners": "2",
      "Fuel": "Propane",
      "Output": "10000 BTU per burner",
      "Folded Size": "54 x 33 x 10 cm",
    },
  },

  {
    providerIndex: 3,
    category: "Camping",
    name: "4 Season Expedition Tent",
    description: "Storm rated geodesic tent for winter and high altitude camping.",
    brand: "MSR",
    pricePerDay: 28,
    condition: Condition.GOOD,
    stock: 2,
    images: [unsplash("1510312305653-8ed496efae75"), unsplash("1571687949921-1306bfb24b72")],
    specifications: {
      "Capacity": "3 people",
      "Season": "4 season",
      "Wind Rating": "Storm proof",
      "Packed Weight": "3.9 kg",
    },
  },

  {
    providerIndex: 1,
    category: "Camping",
    name: "Sleeping Bag -5C",
    description: "Mummy sleeping bag rated to minus five degrees celsius.",
    brand: "Coleman",
    pricePerDay: 8,
    condition: Condition.GOOD,
    stock: 10,
    images: [unsplash("1526491109672-74740652b963"), unsplash("1504280390367-361c6d9f38f4")],
    specifications: {
      "Comfort Rating": "-5C",
      "Fill": "Synthetic hollow fibre",
      "Weight": "1.6 kg",
      "Shape": "Mummy",
    },
  },

  {
    providerIndex: 3,
    category: "Camping",
    name: "Family Camping Bundle",
    description: "Tent, stove, chairs and lanterns packaged for a family weekend.",
    brand: "Coleman",
    pricePerDay: 40,
    condition: Condition.GOOD,
    stock: 3,
    images: [unsplash("1526491109672-74740652b963"), unsplash("1523987355523-c7b5b0dd90a7")],
    specifications: {
      "Includes": "6 person tent, stove, 4 chairs, 2 lanterns",
      "Capacity": "6 people",
      "Setup": "Around 25 minutes",
    },
  },

  {
    providerIndex: 3,
    category: "Camping",
    name: "Camping Cookware Set",
    description: "Nesting pots, pans and utensils for cooking at camp.",
    brand: "MSR",
    pricePerDay: 7,
    condition: Condition.NEW,
    stock: 12,
    images: [unsplash("1523987355523-c7b5b0dd90a7"), unsplash("1571687949921-1306bfb24b72")],
    specifications: {
      "Pieces": "12",
      "Material": "Hard anodised aluminium",
      "Packed": "Nests into one pot",
      "Serves": "4 people",
    },
  },

  {
    providerIndex: 0,
    category: "Fitness",
    name: "Adjustable Dumbbell Set",
    description: "Pair of adjustable dumbbells covering 5 to 25 kg per hand.",
    brand: "Bowflex",
    pricePerDay: 8,
    condition: Condition.NEW,
    stock: 10,
    images: [unsplash("1584735935682-2f2b69dff9d2"), unsplash("1540497077202-7c8a3999166f")],
    specifications: {
      "Weight Range": "5 kg to 25 kg per dumbbell",
      "Material": "Cast iron with rubber coating",
      "Adjustment": "Dial based",
      "Includes": "Pair with storage tray",
    },
  },

  {
    providerIndex: 0,
    category: "Fitness",
    name: "Kettlebell Set",
    description: "Three cast iron kettlebells at 8, 12 and 16 kg.",
    brand: "Bowflex",
    pricePerDay: 10,
    condition: Condition.GOOD,
    stock: 6,
    images: [unsplash("1584735935682-2f2b69dff9d2"), unsplash("1571019613454-1cb2f99b2d8b")],
    specifications: {
      "Weights": "8 kg, 12 kg, 16 kg",
      "Material": "Cast iron",
      "Coating": "Vinyl dipped",
      "Handle": "Wide grip",
    },
  },

  {
    providerIndex: 2,
    category: "Fitness",
    name: "Indoor Spin Bike",
    description: "Belt driven spin bike with adjustable magnetic resistance.",
    brand: "Peloton",
    pricePerDay: 35,
    condition: Condition.NEW,
    stock: 3,
    images: [unsplash("1540497077202-7c8a3999166f"), unsplash("1584735935682-2f2b69dff9d2")],
    specifications: {
      "Drive": "Belt",
      "Resistance": "Magnetic, 32 levels",
      "Flywheel": "18 kg",
      "Display": "Cadence and heart rate",
    },
  },

  {
    providerIndex: 2,
    category: "Fitness",
    name: "Yoga Mat and Block Set",
    description: "Non slip mat with two cork blocks and a stretching strap.",
    brand: "Manduka",
    pricePerDay: 5,
    condition: Condition.NEW,
    stock: 15,
    images: [unsplash("1544367567-0f2fcb009e0b"), unsplash("1571019613454-1cb2f99b2d8b")],
    specifications: {
      "Mat Thickness": "6mm",
      "Material": "Natural rubber",
      "Includes": "2 cork blocks and strap",
      "Length": "183 cm",
    },
  },

  {
    providerIndex: 0,
    category: "Fitness",
    name: "Resistance Band Set",
    description: "Five looped bands from light to extra heavy with door anchor.",
    brand: "Bowflex",
    pricePerDay: 4,
    condition: Condition.GOOD,
    stock: 20,
    images: [unsplash("1571019613454-1cb2f99b2d8b"), unsplash("1584735935682-2f2b69dff9d2")],
    specifications: {
      "Bands": "5 resistance levels",
      "Material": "Natural latex",
      "Includes": "Door anchor and handles",
      "Max Resistance": "About 60 kg",
    },
  },

  {
    providerIndex: 2,
    category: "Fitness",
    name: "Home Gym Power Rack",
    description: "Squat rack with pull up bar, safety arms and bench.",
    brand: "Rogue",
    pricePerDay: 50,
    condition: Condition.GOOD,
    stock: 2,
    images: [unsplash("1540497077202-7c8a3999166f"), unsplash("1584735935682-2f2b69dff9d2")],
    specifications: {
      "Height": "215 cm",
      "Weight Capacity": "450 kg",
      "Includes": "Bench, J-cups, safety arms",
      "Bar": "Pull up bar included",
    },
  },

  {
    providerIndex: 1,
    category: "Water Sports",
    name: "Kayak",
    description: "Single seat sit-on-top kayak supplied with paddle and buoyancy aid.",
    brand: "Perception",
    pricePerDay: 20,
    condition: Condition.FAIR,
    stock: 3,
    images: [unsplash("1517176118179-65244903d13c"), unsplash("1509914398892-963f53e6e2f1")],
    specifications: {
      "Seats": "1",
      "Length": "3.1 m",
      "Material": "High density polyethylene",
      "Includes": "Paddle and buoyancy aid",
    },
  },

  {
    providerIndex: 1,
    category: "Water Sports",
    name: "Stand Up Paddleboard",
    description: "Inflatable SUP with pump, leash and adjustable paddle.",
    brand: "ISLE",
    pricePerDay: 22,
    condition: Condition.NEW,
    stock: 5,
    images: [unsplash("1517176118179-65244903d13c"), unsplash("1509914398892-963f53e6e2f1")],
    specifications: {
      "Length": "10 ft 6 in",
      "Type": "Inflatable",
      "Max Rider": "120 kg",
      "Includes": "Pump, leash, paddle, bag",
    },
  },

  {
    providerIndex: 3,
    category: "Water Sports",
    name: "Scuba Diving Set",
    description: "Complete recreational dive set including BCD and regulator.",
    brand: "Cressi",
    pricePerDay: 38,
    condition: Condition.GOOD,
    stock: 4,
    images: [unsplash("1544551763-46a013bb70d5"), unsplash("1530549387789-4c1017266635")],
    specifications: {
      "Includes": "BCD, regulator, gauges, mask, fins",
      "Tank": "Not included",
      "Certification": "Open water required",
      "Sizes": "S to XL",
    },
  },

  {
    providerIndex: 1,
    category: "Water Sports",
    name: "Snorkel and Fin Set",
    description: "Tempered glass mask, dry snorkel and adjustable open heel fins.",
    brand: "Cressi",
    pricePerDay: 9,
    condition: Condition.NEW,
    stock: 14,
    images: [unsplash("1544551763-46a013bb70d5"), unsplash("1530549387789-4c1017266635")],
    specifications: {
      "Mask": "Tempered glass, low volume",
      "Snorkel": "Dry top",
      "Fins": "Adjustable open heel",
      "Sizes": "S to XL",
    },
  },

  {
    providerIndex: 3,
    category: "Water Sports",
    name: "Surfboard 7ft Funboard",
    description: "Forgiving 7ft funboard that suits beginners and intermediates.",
    brand: "Torq",
    pricePerDay: 24,
    condition: Condition.GOOD,
    stock: 6,
    images: [unsplash("1502680390469-be75c86b636f"), unsplash("1509914398892-963f53e6e2f1")],
    specifications: {
      "Length": "7 ft",
      "Volume": "52 L",
      "Construction": "Epoxy",
      "Includes": "Leash and fins",
    },
  },

  {
    providerIndex: 3,
    category: "Water Sports",
    name: "Wetsuit 3/2mm",
    description: "Full length 3/2mm neoprene wetsuit with sealed seams.",
    brand: "O Neill",
    pricePerDay: 14,
    condition: Condition.GOOD,
    stock: 10,
    images: [unsplash("1509914398892-963f53e6e2f1"), unsplash("1544551763-46a013bb70d5")],
    specifications: {
      "Thickness": "3/2 mm",
      "Seams": "Glued and blind stitched",
      "Entry": "Back zip",
      "Sizes": "S to XXL",
    },
  },

  {
    providerIndex: 2,
    category: "Climbing",
    name: "Climbing Rope 60m",
    description: "Dynamic single rope with a dry treatment for outdoor routes.",
    brand: "Petzl",
    pricePerDay: 16,
    condition: Condition.GOOD,
    stock: 5,
    images: [unsplash("1516592673884-4a382d1124c2"), unsplash("1522163182402-834f871fd851")],
    specifications: {
      "Length": "60 m",
      "Diameter": "9.8 mm",
      "Type": "Dynamic single",
      "Treatment": "Dry coated",
    },
  },

  {
    providerIndex: 2,
    category: "Climbing",
    name: "Harness and Belay Kit",
    description: "Adjustable harness, belay device, locking carabiner and chalk bag.",
    brand: "Petzl",
    pricePerDay: 11,
    condition: Condition.NEW,
    stock: 8,
    images: [unsplash("1516592673884-4a382d1124c2"), unsplash("1522163182402-834f871fd851")],
    specifications: {
      "Harness": "Adjustable leg loops",
      "Belay": "Assisted braking",
      "Includes": "Locking carabiner and chalk bag",
      "Sizes": "S to XL",
    },
  },

  {
    providerIndex: 2,
    category: "Climbing",
    name: "Bouldering Crash Pad",
    description: "Folding highball crash pad with dual density foam.",
    brand: "Black Diamond",
    pricePerDay: 19,
    condition: Condition.GOOD,
    stock: 4,
    images: [unsplash("1522163182402-834f871fd851"), unsplash("1516592673884-4a382d1124c2")],
    specifications: {
      "Open Size": "122 x 100 x 10 cm",
      "Foam": "Dual density",
      "Fold": "Taco style",
      "Weight": "5.4 kg",
    },
  },

  {
    providerIndex: 2,
    category: "Climbing",
    name: "Climbing Helmet",
    description: "Lightweight hybrid shell helmet with headlamp clips.",
    brand: "Petzl",
    pricePerDay: 6,
    condition: Condition.NEW,
    stock: 12,
    images: [unsplash("1516592673884-4a382d1124c2"), unsplash("1522163182402-834f871fd851")],
    specifications: {
      "Shell": "Hybrid ABS and EPS",
      "Weight": "240 g",
      "Adjustment": "Dial fit",
      "Extras": "Headlamp clips",
    },
  },

  {
    providerIndex: 3,
    category: "Climbing",
    name: "Via Ferrata Set",
    description: "Certified via ferrata lanyard with energy absorber and harness.",
    brand: "Black Diamond",
    pricePerDay: 13,
    condition: Condition.GOOD,
    stock: 6,
    images: [unsplash("1522163182402-834f871fd851"), unsplash("1516592673884-4a382d1124c2")],
    specifications: {
      "Standard": "EN 958",
      "Includes": "Lanyard, absorber, harness",
      "Weight Range": "40 to 120 kg",
      "Weight": "680 g",
    },
  },

  {
    providerIndex: 3,
    category: "Winter Sports",
    name: "All Mountain Ski Set",
    description: "Skis, bindings and poles tuned for mixed piste conditions.",
    brand: "Rossignol",
    pricePerDay: 34,
    condition: Condition.GOOD,
    stock: 6,
    images: [unsplash("1551698618-1dfe5d97d256"), unsplash("1551524559-8af4e6624178")],
    specifications: {
      "Lengths": "156 to 180 cm",
      "Bindings": "Included and fitted",
      "Type": "All mountain",
      "Includes": "Poles",
    },
  },

  {
    providerIndex: 3,
    category: "Winter Sports",
    name: "Freestyle Ski Set",
    description: "Twin tip park skis for jumps, rails and switch riding.",
    brand: "Rossignol",
    pricePerDay: 30,
    condition: Condition.GOOD,
    stock: 4,
    images: [unsplash("1551524559-8af4e6624178"), unsplash("1551698618-1dfe5d97d256")],
    specifications: {
      "Lengths": "158 to 176 cm",
      "Shape": "Twin tip",
      "Type": "Park and freestyle",
      "Bindings": "Included",
    },
  },

  {
    providerIndex: 3,
    category: "Winter Sports",
    name: "Snowboard and Bindings",
    description: "All mountain snowboard supplied with bindings fitted.",
    brand: "Burton",
    pricePerDay: 33,
    condition: Condition.NEW,
    stock: 5,
    images: [unsplash("1551524559-8af4e6624178"), unsplash("1551698618-1dfe5d97d256")],
    specifications: {
      "Lengths": "149 to 162 cm",
      "Flex": "Medium",
      "Profile": "Hybrid camber",
      "Bindings": "Included",
    },
  },

  {
    providerIndex: 2,
    category: "Winter Sports",
    name: "Ski Boots",
    description: "Heat mouldable alpine ski boots in a range of sizes.",
    brand: "Salomon",
    pricePerDay: 15,
    condition: Condition.GOOD,
    stock: 10,
    images: [unsplash("1551698618-1dfe5d97d256"), unsplash("1551524559-8af4e6624178")],
    specifications: {
      "Sizes": "EU 38 to 47",
      "Flex": "90 to 110",
      "Liner": "Heat mouldable",
      "Buckles": "4 micro adjustable",
    },
  },

  {
    providerIndex: 2,
    category: "Winter Sports",
    name: "Snowshoe Set",
    description: "Aluminium frame snowshoes with adjustable poles included.",
    brand: "Salomon",
    pricePerDay: 12,
    condition: Condition.GOOD,
    stock: 8,
    images: [unsplash("1551524559-8af4e6624178"), unsplash("1551698618-1dfe5d97d256")],
    specifications: {
      "Frame": "Aluminium",
      "Max Load": "120 kg",
      "Binding": "Ratchet strap",
      "Includes": "Adjustable poles",
    },
  },

  {
    providerIndex: 3,
    category: "Winter Sports",
    name: "Avalanche Safety Kit",
    description: "Transceiver, probe and shovel for backcountry travel.",
    brand: "Black Diamond",
    pricePerDay: 20,
    condition: Condition.NEW,
    stock: 6,
    images: [unsplash("1551698618-1dfe5d97d256"), unsplash("1551524559-8af4e6624178")],
    specifications: {
      "Transceiver": "3 antenna digital",
      "Probe": "240 cm aluminium",
      "Shovel": "Aluminium blade",
      "Bag": "Carry pouch included",
    },
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
    method: PaymentMethod;
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
      method: PaymentMethod.CARD,
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
      method: PaymentMethod.CASHAPP,
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
      method: PaymentMethod.CARD,
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
      method: PaymentMethod.CASHAPP,
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
      method: PaymentMethod.CARD,
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
      method: PaymentMethod.CASHAPP,
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
      method: PaymentMethod.CARD,
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
      method: PaymentMethod.CASHAPP,
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
    const description = categoryDescriptions[name];
    const category = await prisma.category.upsert({
      where: { name },
      update: { description },
      create: { name, description },
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
          images: gear.images,
          specifications: gear.specifications,
        },
      });
    } else {
      record = await prisma.gearItem.update({
        where: { id: record.id },
        data: {
          categoryId: categoryIds[gear.category],
          description: gear.description,
          brand: gear.brand,
          pricePerDay: gear.pricePerDay,
          condition: gear.condition,
          images: gear.images,
          specifications: gear.specifications,
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
          method: sample.payment.method,
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
