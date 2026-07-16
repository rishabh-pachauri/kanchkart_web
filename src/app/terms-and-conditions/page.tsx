import { PolicyPage } from "@/components/policy-page";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Terms & Conditions" });

export default function TermsPage() {
  return <PolicyPage title="Terms & Conditions" cmsKey="terms-and-conditions" />;
}

