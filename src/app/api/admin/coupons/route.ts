import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CouponType } from "@prisma/client";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return false;
  }
  return true;
}

// GET all coupons
export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ coupons });
}

// POST - Create a new coupon
export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minOrderValue,
      maxOrderValue,
      maxDiscount,
      startsAt,
      endsAt,
      usageLimit,
      isActive
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Code, Type, and Value are required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await db.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${cleanCode}" already exists.` },
        { status: 400 }
      );
    }

    const newCoupon = await db.coupon.create({
      data: {
        code: cleanCode,
        description: description || null,
        type: type === "PERCENTAGE" ? CouponType.PERCENTAGE : CouponType.FIXED,
        value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxOrderValue: maxOrderValue ? parseFloat(maxOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({ coupon: newCoupon });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - Update an existing coupon
export async function PUT(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, code, description, type, value, minOrderValue, maxOrderValue, maxDiscount, startsAt, endsAt, usageLimit, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required." }, { status: 400 });
    }

    const updated = await db.coupon.update({
      where: { id },
      data: {
        ...(code && { code: code.trim().toUpperCase() }),
        ...(description !== undefined && { description: description || null }),
        ...(type && { type: type === "PERCENTAGE" ? CouponType.PERCENTAGE : CouponType.FIXED }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(minOrderValue !== undefined && { minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null }),
        ...(maxOrderValue !== undefined && { maxOrderValue: maxOrderValue ? parseFloat(maxOrderValue) : null }),
        ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
        ...(startsAt !== undefined && { startsAt: startsAt ? new Date(startsAt) : null }),
        ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit, 10) : null }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) })
      }
    });

    return NextResponse.json({ coupon: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Remove a coupon
export async function DELETE(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
    }

    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete coupon.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
