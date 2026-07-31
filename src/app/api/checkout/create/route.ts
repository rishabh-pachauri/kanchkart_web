import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrderFromCheckout } from "@/lib/orders";
import { createRazorpayOrder } from "@/lib/razorpay";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`checkout:${ip}`, 10, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body." }, { status: 400 });
  }

  // Step 1: Validate and create the order
  let order: Awaited<ReturnType<typeof createOrderFromCheckout>>;
  try {
    order = await createOrderFromCheckout(payload);
  } catch (error: unknown) {
    let errorMessage = "Checkout failed.";
    let statusCode = 400;

    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      errorMessage = firstIssue
        ? `Validation error – ${firstIssue.path.join(".")}: ${firstIssue.message}`
        : "Invalid checkout data submitted.";
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // Database/server errors get a 500
      if (
        errorMessage.includes("Foreign key") ||
        errorMessage.includes("Unique constraint") ||
        errorMessage.includes("database") ||
        errorMessage.includes("prisma") ||
        errorMessage.includes("connect")
      ) {
        statusCode = 500;
        errorMessage = "Server error while saving order. Please try again.";
      }
    }

    console.error("[CHECKOUT ERROR - createOrderFromCheckout]:", error);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }

  // Step 2: Create Razorpay order
  try {
    const razorpay = await createRazorpayOrder(order.orderNumber, order.grandTotal);
    await db.payment.updateMany({
      where: { orderId: order.id, method: "RAZORPAY" },
      data: {
        razorpayOrderId: razorpay.id,
        rawPayload: razorpay as object
      }
    });

    // Always use the same key_id that was used to create the Razorpay order
    const razorpayPublicKey = env.razorpayKeyId;

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentMethod: "RAZORPAY",
      razorpay: {
        key: razorpayPublicKey,
        id: razorpay.id,
        amount: razorpay.amount,
        currency: razorpay.currency
      }
    });
  } catch (error: unknown) {
    console.error("[CHECKOUT ERROR - createRazorpayOrder]:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to initialize payment gateway.";
    return NextResponse.json({ error: `Payment setup failed: ${errorMessage}` }, { status: 500 });
  }
}
