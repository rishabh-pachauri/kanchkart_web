import { NextRequest, NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendOrderConfirmation, sendAdminNotification } from "@/lib/email";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { rateLimit } from "@/lib/rate-limit";
import { formatPrice } from "@/lib/money";

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
      status: OrderStatus.ORDER_RECEIVED,
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
          status: OrderStatus.ORDER_RECEIVED,
          title: "Order Received & Payment Confirmed",
          description: "Payment verified successfully. Your order is confirmed and is being processed."
        }
      }
    },
    include: {
      items: true,
      address: true
    }
  });

  // Increment usedCount on coupon upon successful payment verification
  if (order.couponId) {
    try {
      const updatedCoupon = await db.coupon.update({
        where: { id: order.couponId },
        data: {
          usedCount: { increment: 1 }
        }
      });

      // If usage limit reached, deactivate coupon
      if (updatedCoupon.usageLimit !== null && updatedCoupon.usedCount >= updatedCoupon.usageLimit) {
        await db.coupon.update({
          where: { id: order.couponId },
          data: { isActive: false }
        });
      }
    } catch (err) {
      console.error("[COUPON EXPIRE ERROR - Payment Verification]:", err);
    }
  }

  try {
    await sendOrderConfirmation(order);
    await sendAdminNotification(
      `New Paid KanchKart Order ${order.orderNumber}`,
      `<p>New paid order received from <strong>${order.customerName}</strong> (${order.customerEmail}). Total Paid: <strong>${formatPrice(order.grandTotal)}</strong></p>`
    );
  } catch (err) {
    console.error("[EMAIL ERROR - Payment Verification]:", err);
  }

  return NextResponse.json({ ok: true });
}
