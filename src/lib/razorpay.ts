import crypto from "crypto";
import Razorpay from "razorpay";
import type { Decimal } from "@prisma/client/runtime/library";
import { env, requireServerEnv } from "@/lib/env";
import { paise } from "@/lib/money";

export function razorpayClient() {
  return new Razorpay({
    key_id: requireServerEnv("razorpayKeyId"),
    key_secret: requireServerEnv("razorpayKeySecret")
  });
}

export async function createRazorpayOrder(orderNumber: string, amount: Decimal | number | string) {
  const client = razorpayClient();
  return client.orders.create({
    amount: paise(amount),
    currency: "INR",
    receipt: orderNumber,
    notes: {
      brand: "KanchKart"
    }
  });
}

export function verifyRazorpaySignature(payload: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const secret = requireServerEnv("razorpayKeySecret");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${payload.razorpayOrderId}|${payload.razorpayPaymentId}`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(payload.razorpaySignature)
  );
}

export function publicRazorpayKey() {
  return env.publicRazorpayKeyId || env.razorpayKeyId || "";
}
