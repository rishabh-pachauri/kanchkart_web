import { AuthForm } from "@/components/auth-form";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Login" });

export default function LoginPage() {
  return (
    <section className="container max-w-md py-14">
      <AuthForm mode="login" />
    </section>
  );
}

