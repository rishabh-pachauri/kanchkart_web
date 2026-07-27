import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNavigationData, getProducts } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Shop Catalog",
  description:
    "Shop premium borosilicate glass bottles, airtight storage jars, hand-blown cups, and kitchen glassware."
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
    <section className="container py-12">
      {/* Header & Search */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-gold/15 pb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold">Explore Catalog</span>
          <h1 className="mt-1 font-serif text-5xl font-bold text-charcoal">
            Premium Glassware
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover 100% lead-free borosilicate bottles, pantry jars, and elegant drinkware.
          </p>
        </div>

        <form className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search bottles, jars, cups..."
              defaultValue={params.q}
              className="pl-10 rounded-full border-gold/20 bg-white focus:border-gold"
            />
          </div>

          <Button type="submit" variant="gold" className="rounded-full shadow-gold-glow-sm">
            Search
          </Button>
        </form>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category & Collection Pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            asChild
            variant={!params.category && !params.collection ? "gold" : "outline"}
            size="sm"
            className="rounded-full text-xs font-semibold"
          >
            <Link href="/shop">All Glassware</Link>
          </Button>

          {categories.map((category) => (
            <Button
              asChild
              key={category.id}
              variant={params.category === category.slug ? "gold" : "outline"}
              size="sm"
              className="rounded-full text-xs font-semibold"
            >
              <Link href={`/shop?category=${category.slug}`}>
                {category.name}
              </Link>
            </Button>
          ))}

          {collections.map((collection) => (
            <Button
              asChild
              key={collection.id}
              variant={params.collection === collection.slug ? "gold" : "outline"}
              size="sm"
              className="rounded-full text-xs font-semibold"
            >
              <Link href={`/shop?collection=${collection.slug}`}>
                {collection.name}
              </Link>
            </Button>
          ))}
        </div>

        {/* Sort Select */}
        <form className="flex items-center gap-2 shrink-0">
          {params.q && <input type="hidden" name="q" value={params.q} />}
          {params.category && <input type="hidden" name="category" value={params.category} />}
          {params.collection && <input type="hidden" name="collection" value={params.collection} />}

          <SlidersHorizontal className="h-4 w-4 text-gold" />
          <select
            name="sort"
            defaultValue={params.sort || "featured"}
            className="focus-ring h-9 rounded-full border border-gold/20 bg-white/90 px-3 text-xs font-semibold text-charcoal"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest Additions</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <Button type="submit" size="sm" variant="outline" className="rounded-full text-xs font-bold">
            Sort
          </Button>
        </form>
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="mt-12">
          <EmptyState
            title="No glassware items found"
            body="Try adjusting your search criteria or category filters to discover more KanchKart products."
            actionHref="/shop"
            actionLabel="Clear All Filters"
          />
        </div>
      )}
    </section>
  );
}
