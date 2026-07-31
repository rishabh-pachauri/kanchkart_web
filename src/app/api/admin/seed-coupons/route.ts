import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// One-time coupon seeding endpoint.
// Protected by a secret token to prevent abuse.
// Call via: GET /api/admin/seed-coupons?token=kanchkart-seed-2024
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== "kanchkart-seed-2024") {
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
