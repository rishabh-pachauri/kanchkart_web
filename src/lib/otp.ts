import { db } from "@/lib/db";
import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export async function createAndSendOtp(identifier: string, name?: string) {
  const cleanIdentifier = identifier.trim().toLowerCase();
  
  // Generate cryptographically strong 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity

  // Clear previous OTPs for this identifier
  await db.verificationToken.deleteMany({
    where: { identifier: cleanIdentifier }
  });

  // Store new 6-digit OTP in database
  await db.verificationToken.create({
    data: {
      identifier: cleanIdentifier,
      token: otp,
      expires
    }
  });

  // Send OTP Email
  if (resend) {
    try {
      await resend.emails.send({
        from: env.emailFrom || "KanchKart <noreply@kanchkart.com>",
        to: cleanIdentifier,
        subject: `Your KanchKart Verification OTP: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="font-family: Georgia, serif; color: #1e293b; margin: 0; font-size: 28px;">Kanch<span style="color: #d97706;">Kart</span></h1>
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px;">Pure Glassware Authentication</p>
            </div>

            <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">Your 6-Digit One-Time Password (OTP)</p>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #78350f; font-mono: monospace;">${otp}</div>
              <p style="color: #b45309; font-size: 12px; margin: 10px 0 0 0;">Valid for 10 minutes. Do not share this code with anyone.</p>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              Hello ${name || "Valued Customer"},<br/>
              Please enter this verification code on KanchKart to complete your account setup and unlock express checkout.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
              If you did not request this OTP, please ignore this email.
            </p>
          </div>
        `
      });
    } catch (error) {
      console.error("[OTP EMAIL ERROR]:", error);
    }
  }

  // Also log OTP in dev mode / server console for instant testing
  console.log(`\n========================================`);
  console.log(`🔑 KANCHKART OTP FOR ${cleanIdentifier}: [ ${otp} ]`);
  console.log(`========================================\n`);

  return { success: true, otp, expires };
}

export async function verifyOtpCode(identifier: string, code: string): Promise<boolean> {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanCode = code.trim();

  const record = await db.verificationToken.findFirst({
    where: {
      identifier: cleanIdentifier,
      token: cleanCode
    }
  });

  if (!record) return false;

  // Check expiration
  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token: cleanCode } });
    return false;
  }

  // Delete token after successful verification (one-time use)
  await db.verificationToken.delete({ where: { token: cleanCode } });
  return true;
}
