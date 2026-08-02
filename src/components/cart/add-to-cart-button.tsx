"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [added, setAdded] = useState(false);

  function handleClick() {
    if (!session?.user) {
      const redirectUrl = encodeURIComponent(pathname || `/product/${item.slug}`);
      router.push(`/register?callbackUrl=${redirectUrl}&message=Please+sign+up+or+log+in+first+to+add+products+to+your+cart`);
      return;
    }

    addItem(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Button
      type="button"
      variant="gold"
      disabled={disabled || added}
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
          <span>Add to Bag</span>
        </>
      )}
    </Button>
  );
}
