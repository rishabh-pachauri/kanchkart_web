import { AdminCouponsClient } from "@/components/admin/admin-coupons-client";
import { db } from "@/lib/db";
import { toNumber } from "@/lib/money";

export const metadata = {
  title: "Promotional Coupons & Offers | Admin | KanchKart"
};

export default async function AdminCouponsPage() {
  const rawCoupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" }
  });

  const serializedCoupons = rawCoupons.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    type: c.type,
    value: toNumber(c.value),
    minOrderValue: c.minOrderValue ? toNumber(c.minOrderValue) : null,
    maxDiscount: c.maxDiscount ? toNumber(c.maxDiscount) : null,
    startsAt: c.startsAt ? c.startsAt.toISOString() : null,
    endsAt: c.endsAt ? c.endsAt.toISOString() : null,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    isActive: c.isActive,
    createdAt: c.createdAt.toISOString()
  }));

  return <AdminCouponsClient initialCoupons={serializedCoupons} />;
}
