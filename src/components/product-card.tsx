import Image from "next/image";
import Link from "next/link";
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
  const rating =
    product.reviews?.length
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : null;

  return (
    <article className="group rounded-md border bg-white/70 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="glass-highlight relative aspect-square overflow-hidden rounded-md bg-secondary">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.isNewArrival ? <Badge>New</Badge> : null}
            {product.isBestSeller ? <Badge>Best seller</Badge> : null}
          </div>
        </div>
        <div className="mt-4 min-h-24">
          <h3 className="line-clamp-2 font-serif text-xl font-semibold leading-tight">{product.name}</h3>
          {product.shortDescription ? (
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
              {product.shortDescription}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-semibold">{formatPrice(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          {rating ? <p className="mt-1 text-xs text-muted-foreground">{rating.toFixed(1)} rating</p> : null}
        </div>
      </Link>
      <div className="mt-4">
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
      </div>
    </article>
  );
}

