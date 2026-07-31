import { NextRequest, NextResponse } from "next/server";
import { razorpayClient } from "@/lib/razorpay";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const keyId = env.razorpayKeyId;
    const keySecret = env.razorpayKeySecret;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Razorpay API credentials are missing from environment." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const amountInPaise = Number(body.amount);

    // If amount is not provided or invalid
    if (isNaN(amountInPaise)) {
      return NextResponse.json(
        { error: "Valid amount parameter is required." },
        { status: 400 }
      );
    }

    // Minimum amount requirement: 100 paise (₹1)
    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1)." },
        { status: 400 }
      );
    }

    const currency = body.currency || "INR";
    const receipt = body.receipt || `rcpt_${Date.now()}`;

    const client = razorpayClient();
    const order = await client.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: body.notes || { brand: "KanchKart" }
    });

    return NextResponse.json(
      {
        order_id: order.id,
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    if (errorMsg.includes("401") || errorMsg.includes("Authentication")) {
      return NextResponse.json(
        { error: "Razorpay API authentication failed. Check credentials." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: errorMsg || "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
