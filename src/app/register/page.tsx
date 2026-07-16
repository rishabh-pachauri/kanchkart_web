import { AuthForm } from "@/components/auth-form";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Register" });

export default function RegisterPage() {
  return (
    <section className="container max-w-md py-14">
      <AuthForm mode="register" />
    </section>
  );
}

