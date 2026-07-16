import { NextRequest, NextResponse } from "next/server";
import { createOrderFromCheckout } from "@/lib/orders";
import { createRazorpayOrder, publicRazorpayKey } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`checkout:${ip}`, 10, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });

  try {
    const order = await createOrderFromCheckout(await request.json());

    if (order.paymentMethod === "COD") {
      return NextResponse.json({
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentMethod: "COD"
      });
    }

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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed." },
      { status: 400 }
    );
  }
}

