"use client";

import { ShoppingBag } from "lucide-react";
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

  function handleClick() {
    if (!session?.user) {
      const redirectUrl = encodeURIComponent(pathname || `/product/${item.slug}`);
      router.push(`/login?callbackUrl=${redirectUrl}&error=Please+login+or+signup+first+to+add+products+to+your+cart`);
      return;
    }
    addItem(item);
  }

  return (
    <Button
      type="button"
      variant="gold"
      disabled={disabled}
      onClick={handleClick}
      className="w-full"
    >
      <ShoppingBag className="h-4 w-4" />
      Add to cart
    </Button>
  );
}
