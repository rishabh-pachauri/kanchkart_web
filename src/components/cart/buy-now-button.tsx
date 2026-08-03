"use client";

import { useSession } from "next-auth/react";
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
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  function handleBuyNow() {
    if (status === "unauthenticated") {
      const redirectUrl = encodeURIComponent(pathname || `/product/${item.slug}`);
      router.push(`/register?callbackUrl=${redirectUrl}&message=Please+sign+up+or+log+in+first+to+complete+your+purchase`);
      return;
    }

    addItem(item);
    router.push("/checkout");
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={handleBuyNow}
      className="w-full rounded-full border-gold/40 text-charcoal font-bold hover:bg-gold/15 transition-all gap-2 py-6"
    >
      <Zap className="h-4 w-4 text-amber-600 fill-amber-500" />
      <span>Buy Now</span>
    </Button>
  );
}
