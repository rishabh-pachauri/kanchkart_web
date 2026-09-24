"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartSession } from "@/components/cart/use-cart-session";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

type Props = {
  item: {
    productId: string;
    variantId?: string | null;
    name: string;
    slug: string;
    price: number;
    image?: string | null;
  };
  disabled?: boolean;
};

export function AddToCartButton({ item, disabled }: Props) {
  const { addItem } = useCart();
  const { ready, checking, error, requireSession } = useCartSession();
  const router = useRouter();
  const pathname = usePathname();
  const [added, setAdded] = useState(false);

  async function handleClick() {
    const authenticated = await requireSession();
    if (authenticated === null) return;
    if (!authenticated) {
      const redirectUrl = encodeURIComponent(pathname || `/product/${item.slug}`);
      router.push(`/login?callbackUrl=${redirectUrl}&message=Please+sign+up+or+log+in+first+to+add+products+to+your+cart`);
      return;
    }

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
    <Button
      type="button"
      variant="gold"
      disabled={disabled || added || !ready || checking}
      onClick={handleClick}
      className="w-full font-bold transition-all"
    >
      {added ? (
        <>
          <Check className="h-4 w-4 text-emerald-950" />
          <span>Added to Bag!</span>
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          <span>{!ready || checking ? "Checking session…" : "Add to Bag"}</span>
        </>
      )}
    </Button>
    {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    </>
  );
}
