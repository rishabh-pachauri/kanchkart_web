import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductReviewsSection } from "@/components/reviews/product-reviews-section";
import { Badge } from "@/components/ui/badge";
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

  const reviewCount = product.reviews?.length || 0;
  const avgRating =
    reviewCount > 0
      ? (product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1)
      : "5.0";

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
      <section className="container grid gap-12 py-12 lg:grid-cols-[1fr_0.9fr]">
        <ProductGallery media={product.media} name={product.name} />

        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            {product.isNewArrival ? <Badge>New arrival</Badge> : null}
            {product.isBestSeller ? <Badge>Best seller</Badge> : null}
            {product.stock <= product.lowStockAt && product.stock > 0 ? <Badge>Low stock</Badge> : null}

            {/* Rating summary badge */}
            <a
              href="#reviews-section"
              className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-2.5 py-0.5 rounded-full hover:bg-amber-200 transition"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{avgRating}</span>
              <span className="text-slate-600 font-normal">({reviewCount > 0 ? `${reviewCount} reviews` : "Rate Product"})</span>
            </a>
          </div>

          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight text-charcoal">{product.name}</h1>
          {product.shortDescription ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">{product.shortDescription}</p>
          ) : null}

          <div className="mt-6 flex items-end gap-3">
            <p className="text-3xl font-extrabold text-charcoal">{formatPrice(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="pb-1 text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Inclusive of all taxes. Shipping calculated at checkout.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
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
            <BuyNowButton
              disabled={product.stock <= 0}
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: toNumber(product.price),
                image
              }}
            />
          </div>

          <div className="mt-10 grid gap-4 rounded-2xl border border-gold/15 bg-white/70 p-6 shadow-sm">
            <div>
              <p className="font-bold text-charcoal text-base">Product Description</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>
            {product.dimensions ? (
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-charcoal">Dimensions:</span> {product.dimensions}
              </p>
            ) : null}
            {product.weightGrams ? (
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-charcoal">Weight:</span> {product.weightGrams} g
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              <span className="font-bold text-charcoal">SKU:</span> {product.sku}
            </p>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Rating System */}
      <ProductReviewsSection
        productId={product.id}
        productName={product.name}
        productImage={image}
      />

      {related.length ? (
        <section className="container border-t border-gold/15 py-16">
          <h2 className="font-serif text-3xl font-bold text-charcoal mb-8">Related Products</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
