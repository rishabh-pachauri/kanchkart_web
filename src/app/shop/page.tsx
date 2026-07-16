import Link from "next/link";
import { Filter } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNavigationData, getProducts } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Shop",
  description: "Shop premium glass bottles, jars, cups, containers, and kitchen storage."
});

export default async function ShopPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [{ categories, collections }, products] = await Promise.all([
    getNavigationData(),
    getProducts({
      q: params.q,
      category: params.category,
      collection: params.collection,
      sort: params.sort
    })
  ]);

  return (
    <section className="container py-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-gold">Shop</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Premium glassware</h1>
        </div>
        <form className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <Input name="q" placeholder="Search bottles, jars, mugs" defaultValue={params.q} />
          <Button type="submit">
            <Filter className="h-4 w-4" />
            Search
          </Button>
        </form>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild variant={!params.category && !params.collection ? "gold" : "outline"} size="sm">
          <Link href="/shop">All</Link>
        </Button>
        {categories.map((category) => (
          <Button
            asChild
            key={category.id}
            variant={params.category === category.slug ? "gold" : "outline"}
            size="sm"
          >
            <Link href={`/shop?category=${category.slug}`}>{category.name}</Link>
          </Button>
        ))}
        {collections.map((collection) => (
          <Button
            asChild
            key={collection.id}
            variant={params.collection === collection.slug ? "gold" : "outline"}
            size="sm"
          >
            <Link href={`/shop?collection=${collection.slug}`}>{collection.name}</Link>
          </Button>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <form>
          {params.q ? <input type="hidden" name="q" value={params.q} /> : null}
          {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
          <select
            name="sort"
            defaultValue={params.sort || "featured"}
            className="focus-ring h-10 rounded-md border bg-white/80 px-3 text-sm"
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </form>
      </div>

      {products.length ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="No products found"
            body="Adjust the search or category filters to discover more KanchKart glassware."
            actionHref="/shop"
            actionLabel="Clear filters"
          />
        </div>
      )}
    </section>
  );
}

