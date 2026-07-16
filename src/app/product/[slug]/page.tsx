import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductBySlug, getRelatedProducts } from "@/lib/commerce";
import { formatPrice, toNumber } from "@/lib/money";
import { productJsonLd, siteMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return siteMetadata({ title: "Product not found" });

  return siteMetadata({
    title: product.seoTitle || product.name,
    description: product.seoDesc || product.shortDescription || product.description,
    path: `/product/${product.slug}`,
    image: product.media[0]?.url
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId);
  const image = product.media[0]?.url || "/brand/drinkware.svg";
  const jsonLd = productJsonLd({
    name: product.name,
    description: product.description,
    slug: product.slug,
    sku: product.sku,
    image,
    price: String(product.price),
    stock: product.stock
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="container grid gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-[96px_1fr]">
          <div className="hidden gap-3 md:grid">
            {product.media.map((media) => (
              <div key={media.id} className="relative aspect-square overflow-hidden rounded-md border bg-white">
                <Image src={media.url} alt={media.alt} fill sizes="96px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="glass-highlight relative aspect-square overflow-hidden rounded-md border bg-secondary shadow-soft">
            <Image src={image} alt={product.name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isNewArrival ? <Badge>New arrival</Badge> : null}
            {product.isBestSeller ? <Badge>Best seller</Badge> : null}
            {product.stock <= product.lowStockAt && product.stock > 0 ? <Badge>Low stock</Badge> : null}
          </div>
          <h1 className="mt-5 font-serif text-5xl font-semibold leading-none">{product.name}</h1>
          {product.shortDescription ? (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{product.shortDescription}</p>
          ) : null}
          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-semibold">{formatPrice(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="pb-1 text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Inclusive of GST. Shipping calculated at checkout.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <AddToCartButton
              disabled={product.stock <= 0}
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: toNumber(product.price),
                image
              }}
            />
            <Button asChild variant="outline">
              <a href="/checkout">Buy now</a>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 rounded-md border bg-white/70 p-5">
            <div>
              <p className="font-semibold">Description</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{product.description}</p>
            </div>
            {product.dimensions ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-charcoal">Dimensions:</span> {product.dimensions}
              </p>
            ) : null}
            {product.weightGrams ? (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-charcoal">Weight:</span> {product.weightGrams} g
              </p>
            ) : null}
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-charcoal">SKU:</span> {product.sku}
            </p>
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="container border-t py-14">
          <h2 className="font-serif text-3xl font-semibold">Related products</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

