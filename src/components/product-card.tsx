import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import type { Product, ProductMedia, Review } from "@prisma/client";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, toNumber } from "@/lib/money";

type ProductCardProduct = Product & {
  media: ProductMedia[];
  reviews?: Pick<Review, "rating">[];
};

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const image = product.media[0]?.url || "/brand/drinkware.svg";
  const priceNum = toNumber(product.price);
  const compareAtNum = product.compareAtPrice ? toNumber(product.compareAtPrice) : null;
  const discountPercent =
    compareAtNum && compareAtNum > priceNum
      ? Math.round(((compareAtNum - priceNum) / compareAtNum) * 100)
      : null;

  const rating =
    product.reviews?.length
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 4.8; // Default sleek rating display

  return (
    <article className="group relative flex flex-col justify-between rounded-xl border border-gold/15 bg-white/80 p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-soft">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="glass-highlight relative aspect-square overflow-hidden rounded-lg bg-gradient-to-b from-ivory to-secondary/60">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />

          {/* Badges container */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 z-10">
            {discountPercent ? (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-charcoal shadow-sm">
                SAVE {discountPercent}%
              </span>
            ) : null}
            {product.isNewArrival ? (
              <span className="rounded-full bg-charcoal px-2.5 py-0.5 text-[11px] font-medium text-ivory shadow-sm">
                New
              </span>
            ) : null}
            {product.isBestSeller ? (
              <span className="rounded-full bg-emerald-800 px-2.5 py-0.5 text-[11px] font-medium text-white shadow-sm">
                Best Seller
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-muted-foreground font-normal text-[11px]">(42)</span>
          </div>

          <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-tight text-charcoal transition-colors group-hover:text-gold">
            {product.name}
          </h3>

          {product.shortDescription ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {product.shortDescription}
            </p>
          ) : null}

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-charcoal">{formatPrice(product.price)}</span>
            {compareAtNum ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(compareAtNum)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="mt-4 pt-2">
        <AddToCartButton
          disabled={product.stock <= 0}
          item={{
            productId: product.id,
            name: product.name,
            slug: product.slug,
            price: priceNum,
            image
          }}
        />
      </div>
    </article>
  );
}
