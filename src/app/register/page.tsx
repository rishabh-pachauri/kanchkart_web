import { AuthOtpForm } from "@/components/auth-otp-form";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "OTP Account Verification & Registration" });

export default function RegisterPage() {
  return (
    <section className="container max-w-lg py-12 px-4">
      <AuthOtpForm />
    </section>
  );
}
