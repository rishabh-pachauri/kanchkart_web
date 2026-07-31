import crypto from "crypto";
import Razorpay from "razorpay";
import type { Decimal } from "@prisma/client/runtime/library";
import { env, requireServerEnv } from "@/lib/env";

export function razorpayClient() {
  return new Razorpay({
    key_id: requireServerEnv("razorpayKeyId"),
    key_secret: requireServerEnv("razorpayKeySecret")
  });
}

export async function createRazorpayOrder(orderNumber: string, amount: Decimal | number | string) {
  const keyId = env.razorpayKeyId;
  const keySecret = env.razorpayKeySecret;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
  }

  const client = new Razorpay({ key_id: keyId, key_secret: keySecret });

  // Convert Decimal/string to integer paise, minimum 100 (₹1)
  const amountInPaise = Math.max(100, Math.round(Number(amount) * 100));

  try {
    const order = await client.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderNumber.slice(0, 40), // Razorpay receipt max 40 chars
      notes: { brand: "KanchKart" }
    });
    return order;
  } catch (err: unknown) {
    console.error("[RAZORPAY createOrder ERROR]:", err);
    throw new Error(
      `Razorpay API error: ${err instanceof Error ? err.message : JSON.stringify(err)}`
    );
  }
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
