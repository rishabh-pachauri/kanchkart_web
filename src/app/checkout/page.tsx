import { CheckoutClient } from "@/components/checkout/checkout-client";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";

export const metadata = siteMetadata({ title: "Checkout" });

export default async function CheckoutPage() {
  // Strictly enforce user authentication for checkout
  await requireUser();

  return (
    <section className="container max-w-5xl py-8 px-4 space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gold">Express Checkout</p>
        <h1 className="mt-1 font-serif text-4xl sm:text-5xl font-semibold text-charcoal">Complete Your Glassware Order</h1>
      </div>
      <div className="mt-6">
        <CheckoutClient />
      </div>
    </section>
  );
}
