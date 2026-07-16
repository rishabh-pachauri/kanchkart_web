"use client";

import { ShoppingBag } from "lucide-react";
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

  return (
    <Button
      type="button"
      variant="gold"
      disabled={disabled}
      onClick={() => addItem(item)}
      className="w-full"
    >
      <ShoppingBag className="h-4 w-4" />
      Add to cart
    </Button>
  );
}

