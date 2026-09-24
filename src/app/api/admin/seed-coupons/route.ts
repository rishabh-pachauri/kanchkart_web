import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = [
    {
      code: "KANCH10",
      description: "10% off your order at KanchKart",
      type: "PERCENTAGE" as const,
      value: 10,
      minOrderValue: 0,
      maxDiscount: 500,
      isActive: true
    },
    {
      code: "WELCOME",
      description: "Flat ₹50 off on orders above ₹300",
      type: "FIXED" as const,
      value: 50,
      minOrderValue: 300,
      maxDiscount: null,
      isActive: true
    }
  ];

  const results = [];
  for (const coupon of coupons) {
    const result = await db.coupon.upsert({
      where: { code: coupon.code },
      update: {
        description: coupon.description,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount ?? undefined,
        isActive: coupon.isActive
      },
      create: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount ?? undefined,
        isActive: coupon.isActive
      }
    });
    results.push({ code: result.code, type: result.type, value: String(result.value), active: result.isActive });
  }

  return NextResponse.json({ success: true, seeded: results });
}
