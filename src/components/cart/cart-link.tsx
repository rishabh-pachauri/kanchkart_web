"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="focus-ring relative inline-flex h-10 w-10 items-center justify-center rounded-md border bg-white/70"
      aria-label={`Cart with ${count} item${count === 1 ? "" : "s"}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count ? (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-charcoal">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

