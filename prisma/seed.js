// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Upsert seller
  const seller = await prisma.user.upsert({
    where: { email: "seller@example.com" },
    update: {},
    create: {
      email: "seller@example.com",
      name: "Alice Seller",
      role: "SELLER", 
    },
  });

  // Upsert buyer
  const buyer = await prisma.user.upsert({
    where: { email: "buyer@example.com" },
    update: {},
    create: {
      email: "buyer@example.com",
      name: "Bob Buyer",
      role: "BUYER",
    },
  });

  const now = new Date();
  const start = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now
  const end = new Date(now.getTime() + 1000 * 60 * 90);   // 1.5 hours from now

  // Create appointment
  await prisma.appointment.create({
    data: {
      start,
      end,
      sellerId: seller.id, // INTEGER ID
      buyerId: buyer.id,   // INTEGER ID
    },
  });

  console.log("✅ Seed complete: 1 seller, 1 buyer, 1 appointment");
}

// Run seed
main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
