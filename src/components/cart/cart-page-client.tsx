"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatPrice, shippingFor } from "@/lib/money";

export function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        body="Add premium glassware to your cart and return here for checkout."
        actionHref="/shop"
        actionLabel="Shop now"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="grid gap-4">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId || "default"}`} className="grid gap-4 rounded-md border bg-white/70 p-4 sm:grid-cols-[112px_1fr_auto]">
            <div className="relative aspect-square overflow-hidden rounded-md bg-secondary">
              <Image src={item.image || "/brand/drinkware.svg"} alt={item.name} fill sizes="112px" className="object-cover" />
            </div>
            <div>
              <Link href={`/product/${item.slug}`} className="font-serif text-2xl font-semibold">
                {item.name}
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">{formatPrice(item.price)}</p>
              <div className="mt-4 inline-flex items-center rounded-md border bg-white">
                <button
                  className="focus-ring h-10 w-10 rounded-md"
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                >
                  <Minus className="mx-auto h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  className="focus-ring h-10 w-10 rounded-md"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                >
                  <Plus className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>
            <button
              className="focus-ring h-10 w-10 rounded-md border"
              aria-label="Remove item"
              onClick={() => removeItem(item.productId, item.variantId)}
            >
              <Trash2 className="mx-auto h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-md border bg-white/70 p-5 shadow-sm">
        <h2 className="font-serif text-3xl font-semibold">Order summary</h2>
        <div className="mt-5 grid gap-3 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </p>
          <p className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping ? formatPrice(shipping) : "Free"}</span>
          </p>
          <p className="border-t pt-3 flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </p>
        </div>
        <Button asChild variant="gold" className="mt-6 w-full">
          <Link href="/checkout">Checkout</Link>
        </Button>
      </aside>
    </div>
  );
}

