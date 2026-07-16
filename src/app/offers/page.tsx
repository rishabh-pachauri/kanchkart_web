import { Percent } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/commerce";
import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Offers",
  description: "Current KanchKart offers and premium glassware deals."
});

export default async function OffersPage() {
  const [products, coupons] = await Promise.all([
    getProducts({ sort: "featured" }),
    db.coupon.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 6
    })
  ]);

  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Offers</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Glassware worth bringing home</h1>
      {coupons.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-md border bg-white/70 p-5">
              <Percent className="h-6 w-6 text-gold" />
              <p className="mt-4 text-xl font-semibold">{coupon.code}</p>
              {coupon.description ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{coupon.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products
          .filter((product) => product.compareAtPrice)
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </section>
  );
}

