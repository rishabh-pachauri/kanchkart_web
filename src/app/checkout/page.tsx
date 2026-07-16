import { CheckoutClient } from "@/components/checkout/checkout-client";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Checkout" });

export default function CheckoutPage() {
  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Checkout</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Complete your order</h1>
      <div className="mt-8">
        <CheckoutClient />
      </div>
    </section>
  );
}

