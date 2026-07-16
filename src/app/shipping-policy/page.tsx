import { PolicyPage } from "@/components/policy-page";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Shipping Policy" });

export default function ShippingPolicyPage() {
  return <PolicyPage title="Shipping Policy" cmsKey="shipping-policy" />;
}

