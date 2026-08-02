import { NextRequest, NextResponse } from "next/server";
import { createAndSendOtp } from "@/lib/otp";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  name: z.string().trim().optional()
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const limited = await rateLimit(`otp-send:${ip}`, 10, 60);
  if (!limited.ok) return NextResponse.json({ error: "Too many OTP requests. Please wait a minute." }, { status: 429 });

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid email" }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Check if account already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account already exists for this email. Please click Log In below." },
        { status: 400 }
      );
    }

    const result = await createAndSendOtp(email, parsed.data.name);

    if (!result.emailSent) {
      const isDomainTestingRestriction = result.emailError?.includes("testing emails") || 
                                          result.emailError?.includes("resend.com/domains") || 
                                          result.emailError?.includes("only send");

      return NextResponse.json(
        {
          error: `Resend Email Delivery Error: ${result.emailError}`,
          canBypass: true,
          isTestingMode: isDomainTestingRestriction
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification OTP code has been sent to ${email}. Please check your email inbox and spam folder.`
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
