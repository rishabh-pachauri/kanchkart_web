import { CartPageClient } from "@/components/cart/cart-page-client";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Cart" });

export default function CartPage() {
  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Cart</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Your selection</h1>
      <div className="mt-8">
        <CartPageClient />
      </div>
    </section>
  );
}

