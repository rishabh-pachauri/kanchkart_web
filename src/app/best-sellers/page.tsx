import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Best Sellers",
  description: "Most-loved KanchKart bottles, jars, cups, and kitchen glassware."
});

export default async function BestSellersPage() {
  const products = await getProducts({ bestSeller: true });
  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Best sellers</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Most-loved glassware</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

