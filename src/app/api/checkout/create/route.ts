import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromCheckout } from "@/lib/orders";
import { createRazorpayOrder, publicRazorpayKey } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`checkout:${ip}`, 10, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });

  try {
    const payload = await request.json();
    const order = await createOrderFromCheckout(payload);

    const razorpay = await createRazorpayOrder(order.orderNumber, order.grandTotal);
    await db.payment.updateMany({
      where: { orderId: order.id, method: "RAZORPAY" },
      data: {
        razorpayOrderId: razorpay.id,
        rawPayload: razorpay as object
      }
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: "RAZORPAY",
      razorpay: {
        key: publicRazorpayKey(),
        id: razorpay.id,
        amount: razorpay.amount,
        currency: razorpay.currency
      }
    });
  } catch (error: unknown) {
    let errorMessage = "Checkout failed.";
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      errorMessage = firstIssue
        ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
        : "Invalid checkout submission data.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 400 }
    );
  }
}
