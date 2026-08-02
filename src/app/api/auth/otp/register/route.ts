import { NextRequest, NextResponse } from "next/server";
import { verifyOtpCode } from "@/lib/otp";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerOtpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  otp: z.string().trim().length(6, "OTP must be exactly 6 digits")
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration payload" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const { name, password, otp } = parsed.data;

    // Verify OTP first!
    const isValidOtp = await verifyOtpCode(email, otp);
    if (!isValidOtp) {
      return NextResponse.json(
        { error: "Invalid or expired 6-digit OTP code. Please enter the correct OTP or request a new one." },
        { status: 400 }
      );
    }

    // Check existing account
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account already exists for this email. Please log in." },
        { status: 400 }
      );
    }

    // Create user account after successful OTP verification!
    await db.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
        emailVerified: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Account verified and created successfully! Redirecting to login..."
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to verify OTP and create account";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
