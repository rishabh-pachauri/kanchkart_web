import { PolicyPage } from "@/components/policy-page";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Privacy Policy" });

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" cmsKey="privacy-policy" />;
}

