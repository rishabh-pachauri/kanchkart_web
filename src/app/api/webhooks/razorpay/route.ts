import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { env, requireServerEnv } from "@/lib/env";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";
  const expected = crypto
    .createHmac("sha256", requireServerEnv("razorpayWebhookSecret"))
    .update(rawBody)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  const payload = JSON.parse(rawBody);
  const paymentId = payload?.payload?.payment?.entity?.id;
  const status = payload?.event === "payment.captured" ? PaymentStatus.PAID : undefined;

  if (paymentId && status) {
    await db.payment.updateMany({
      where: { razorpayPaymentId: paymentId },
      data: { status, rawPayload: payload }
    });
  }

  return NextResponse.json({ ok: true, mode: env.appUrl.includes("localhost") ? "local" : "production" });
}

