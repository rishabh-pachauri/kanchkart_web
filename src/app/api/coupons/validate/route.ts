import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json() as { code: string; subtotal: number };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Please enter a coupon code." }, { status: 400 });
    }

    const coupon = await db.coupon.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        isActive: true,
        OR: [{ startsAt: null }, { startsAt: { lte: new Date() } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: new Date() } }] }]
      }
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon code." }, { status: 404 });
    }

    const minOrder = coupon.minOrderValue ? toNumber(coupon.minOrderValue) : 0;
    if (minOrder > 0 && subtotal < minOrder) {
      return NextResponse.json(
        { error: `This coupon requires a minimum order of ₹${minOrder.toFixed(0)}.` },
        { status: 400 }
      );
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit." }, { status: 400 });
    }

    const rawDiscount =
      coupon.type === "PERCENTAGE"
        ? (subtotal * toNumber(coupon.value)) / 100
        : toNumber(coupon.value);

    const discount = coupon.maxDiscount
      ? Math.min(rawDiscount, toNumber(coupon.maxDiscount))
      : rawDiscount;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      description: coupon.description ?? `${coupon.type === "PERCENTAGE" ? toNumber(coupon.value) + "%" : "₹" + toNumber(coupon.value)} off`,
      discount: Math.round(discount * 100) / 100
    });
  } catch {
    return NextResponse.json({ error: "Could not validate coupon. Please try again." }, { status: 500 });
  }
}
