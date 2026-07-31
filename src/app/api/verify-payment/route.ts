import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const orderId = body.razorpay_order_id || body.razorpayOrderId;
    const paymentId = body.razorpay_payment_id || body.razorpayPaymentId;
    const signature = body.razorpay_signature || body.razorpaySignature;

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          status: "failure",
          error: "Missing required payment fields (razorpay_order_id, razorpay_payment_id, razorpay_signature)."
        },
        { status: 400 }
      );
    }

    const keySecret = env.razorpayKeySecret;
    if (!keySecret) {
      return NextResponse.json(
        { status: "failure", error: "RAZORPAY_KEY_SECRET is missing in environment variables." },
        { status: 500 }
      );
    }

    // Step 3: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isAuthentic = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );

    if (!isAuthentic) {
      return NextResponse.json(
        {
          status: "failure",
          error: "Payment verification failed: Signature mismatch."
        },
        { status: 400 }
      );
    }

    // Update database payment record if matching payment exists
    try {
      const paymentRecord = await db.payment.findFirst({
        where: { razorpayOrderId: orderId }
      });

      if (paymentRecord) {
        await db.payment.update({
          where: { id: paymentRecord.id },
          data: {
            status: "PAID",
            razorpayPaymentId: paymentId,
            razorpaySignature: signature
          }
        });

        await db.order.update({
          where: { id: paymentRecord.orderId },
          data: {
            paymentStatus: "PAID",
            status: "CONFIRMED"
          }
        });
      }
    } catch (_dbErr) {
      // Continue even if database record update fails or is optional
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Payment verified successfully",
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { status: "failure", error: errorMsg || "Payment verification failed." },
      { status: 500 }
    );
  }
}
