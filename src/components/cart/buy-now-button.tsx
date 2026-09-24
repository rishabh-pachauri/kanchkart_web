"use client";

import { useCartSession } from "@/components/cart/use-cart-session";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";
import { Zap } from "lucide-react";

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

export function BuyNowButton({ item, disabled }: Props) {
  const { addItem } = useCart();
  const { ready, checking, error, requireSession } = useCartSession();
  const router = useRouter();
  const pathname = usePathname();

  async function handleBuyNow() {
    const authenticated = await requireSession();
    if (authenticated === null) return;
    if (!authenticated) {
      const redirectUrl = encodeURIComponent(pathname || `/product/${item.slug}`);
      router.push(`/login?callbackUrl=${redirectUrl}&message=Please+sign+up+or+log+in+first+to+complete+your+purchase`);
      return;
    }

    addItem(item);
    router.push("/checkout");
  }

  return (
    <>
    <Button
      type="button"
      variant="outline"
      disabled={disabled || !ready || checking}
      onClick={handleBuyNow}
      className="w-full rounded-full border-gold/40 text-charcoal font-bold hover:bg-gold/15 transition-all gap-2 py-6"
    >
      <Zap className="h-4 w-4 text-amber-600 fill-amber-500" />
      <span>{!ready || checking ? "Checking session…" : "Buy Now"}</span>
    </Button>
    {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    </>
  );
}
