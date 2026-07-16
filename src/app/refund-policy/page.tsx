import { PolicyPage } from "@/components/policy-page";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Refund Policy" });

export default function RefundPolicyPage() {
  return <PolicyPage title="Refund Policy" cmsKey="refund-policy" />;
}

