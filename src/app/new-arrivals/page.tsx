import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "New Arrivals",
  description: "Fresh premium glassware launches from KanchKart."
});

export default async function NewArrivalsPage() {
  const products = await getProducts({ newArrival: true, sort: "newest" });
  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">New arrivals</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Freshly added glassware</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

