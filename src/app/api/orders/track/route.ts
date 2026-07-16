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
      trackingEvents: { orderBy: { happenedAt: "asc" } }
    }
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    trackingNumber: order.trackingNumber,
    courierPartner: order.courierPartner,
    estimatedDelivery: order.estimatedDelivery,
    timeline: order.trackingEvents
  });
}

