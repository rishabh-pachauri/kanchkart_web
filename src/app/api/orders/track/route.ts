import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { trackOrderSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`track:${ip}`, 20, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const parsed = trackOrderSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid tracking request." }, { status: 400 });

  const order = await db.order.findFirst({
    where: {
      orderNumber: parsed.data.orderNumber,
      customerEmail: parsed.data.email
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              media: true
            }
          }
        }
      },
      trackingEvents: { orderBy: { happenedAt: "asc" } }
    }
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    grandTotal: order.grandTotal,
    trackingNumber: order.trackingNumber,
    courierPartner: order.courierPartner,
    estimatedDelivery: order.estimatedDelivery,
    timeline: order.trackingEvents,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      image: item.product?.media[0]?.url || "/brand/drinkware.svg"
    }))
  });
}
