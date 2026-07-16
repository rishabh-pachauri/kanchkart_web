import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createRazorpayOrder, publicRazorpayKey } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`razorpay-create:${ip}`, 20, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const { orderId } = await request.json();
  const order = await db.order.findUnique({ where: { id: String(orderId || "") } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  const razorpay = await createRazorpayOrder(order.orderNumber, order.grandTotal);
  await db.payment.updateMany({
    where: { orderId: order.id, method: "RAZORPAY" },
    data: { razorpayOrderId: razorpay.id, rawPayload: razorpay as object }
  });

  return NextResponse.json({
    key: publicRazorpayKey(),
    id: razorpay.id,
    amount: razorpay.amount,
    currency: razorpay.currency
  });
}

