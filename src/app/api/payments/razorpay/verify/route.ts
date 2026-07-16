import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  orderId: z.string(),
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string()
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`razorpay-verify:${ip}`, 30, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment payload." }, { status: 400 });

  if (!verifyRazorpaySignature(parsed.data)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const order = await db.order.update({
    where: { id: parsed.data.orderId },
    data: {
      paymentStatus: PaymentStatus.PAID,
      status: OrderStatus.CONFIRMED,
      payments: {
        updateMany: {
          where: { razorpayOrderId: parsed.data.razorpayOrderId },
          data: {
            status: PaymentStatus.PAID,
            razorpayPaymentId: parsed.data.razorpayPaymentId,
            razorpaySignature: parsed.data.razorpaySignature
          }
        }
      },
      trackingEvents: {
        create: {
          status: OrderStatus.CONFIRMED,
          title: "Payment confirmed",
          description: "Your payment has been verified."
        }
      }
    }
  });

  await sendOrderConfirmation(order);
  return NextResponse.json({ ok: true });
}

