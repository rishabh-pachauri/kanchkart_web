"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Minus, Plus, Trash2, Truck, ArrowRight, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { formatPrice } from "@/lib/money";

export function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { data: session } = useSession();
  const router = useRouter();

  const [shippingConfig, setShippingConfig] = useState({
    defaultShippingCost: 50,
    freeShippingThreshold: 1999
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setShippingConfig({
            defaultShippingCost: Number(data.settings.defaultShippingCost ?? 50),
            freeShippingThreshold: Number(data.settings.freeShippingThreshold ?? 1999)
          });
        }
      })
      .catch(() => {});
  }, []);

  const isFreeShipping = subtotal >= shippingConfig.freeShippingThreshold;
  const shipping = isFreeShipping ? 0 : shippingConfig.defaultShippingCost;
  const total = subtotal + shipping;
  const amountToFreeShipping = Math.max(0, shippingConfig.freeShippingThreshold - subtotal);

  function handleProceedToCheckout() {
    if (!session?.user) {
      router.push("/register?callbackUrl=/checkout&message=Please+sign+up+or+log+in+first+to+complete+your+checkout");
      return;
    }
    router.push("/checkout");
  }

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {/* Free Shipping Progress Banner */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-medium">
            {isFreeShipping ? (
              <span className="font-semibold text-emerald-700">🎉 Congratulations! You qualify for FREE Shipping.</span>
            ) : (
              <span>
                Add <strong className="font-bold text-emerald-700">{formatPrice(amountToFreeShipping)}</strong> more to get <strong className="text-emerald-700">FREE Shipping!</strong>
              </span>
            )}
          </p>
        </div>

        {items.map((item) => (
          <div key={`${item.productId}-${item.variantId || "default"}`} className="flex gap-4 border rounded-xl p-4 bg-white shadow-sm">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              <Image
                src={item.image || "/products/pure-glass-water-bottle.jpg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-charcoal truncate">{item.name}</h3>
                  <p className="text-sm text-slate-500">{formatPrice(item.price)}</p>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                    className="p-1 hover:bg-slate-50 text-slate-600"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-medium text-charcoal">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                    className="p-1 hover:bg-slate-50 text-slate-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="font-semibold text-charcoal">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl p-6 h-fit space-y-4 shadow-sm">
        <h2 className="text-lg font-bold text-charcoal">Order Summary</h2>
        <div className="space-y-2 text-sm text-slate-600 border-b pb-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-charcoal">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Shipping</span>
            <span className="font-medium text-charcoal">{shipping ? formatPrice(shipping) : "FREE"}</span>
          </div>
        </div>
        <div className="flex justify-between font-bold text-base text-charcoal pt-1">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <Button
          onClick={handleProceedToCheckout}
          className="w-full bg-gold hover:bg-gold/90 text-charcoal font-bold py-3.5 rounded-xl transition shadow-md gap-2"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
