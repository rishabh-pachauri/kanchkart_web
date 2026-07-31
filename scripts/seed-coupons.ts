/**
 * Run this script to upsert the KANCH10 coupon into the database.
 * Usage: npx tsx scripts/seed-coupons.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const coupons = [
    {
      code: "KANCH10",
      description: "10% off your first order at KanchKart",
      type: "PERCENTAGE" as const,
      value: 10,
      minOrderValue: 200,
      maxDiscount: 500,
      isActive: true
    },
    {
      code: "WELCOME",
      description: "Flat ₹50 off on orders above ₹300",
      type: "FLAT" as const,
      value: 50,
      minOrderValue: 300,
      maxDiscount: null,
      isActive: true
    }
  ];

  for (const coupon of coupons) {
    const result = await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: {
        description: coupon.description,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        isActive: coupon.isActive
      },
      create: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        isActive: coupon.isActive
      }
    });
    console.log(`✅ Upserted coupon: ${result.code} (${result.type} – ${result.value}${result.type === "PERCENTAGE" ? "%" : "₹ flat"})`);
  }

  console.log("\n🎉 All coupons seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
