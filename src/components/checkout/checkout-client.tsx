"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CreditCard, Truck } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { GoogleAddressAutocomplete } from "@/components/checkout/google-address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, shippingFor } from "@/lib/money";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: FormDataEntryValue | null;
    email: FormDataEntryValue | null;
    contact: FormDataEntryValue | null;
  };
  handler: (payment: RazorpayPaymentResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
};

async function loadRazorpay() {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const shipping = shippingFor(subtotal);
  const total = useMemo(() => subtotal + shipping, [shipping, subtotal]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      paymentMethod,
      couponCode: form.get("couponCode") || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      })),
      address: {
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        line1: form.get("line1"),
        line2: form.get("line2"),
        city: form.get("city"),
        state: form.get("state"),
        postalCode: form.get("postalCode"),
        country: "India",
        landmark: form.get("landmark") || undefined
      }
    };

    const response = await fetch("/api/checkout/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(result.error || "Checkout failed.");
      return;
    }

    if (result.paymentMethod === "COD") {
      clearCart();
      router.push(`/checkout/success/${result.orderNumber}`);
      return;
    }

    const loaded = await loadRazorpay();
    const RazorpayConstructor = window.Razorpay;
    if (!loaded || !result.razorpay || !RazorpayConstructor) {
      setLoading(false);
      setError("Razorpay could not be loaded.");
      return;
    }

    const razorpay = new RazorpayConstructor({
      key: result.razorpay.key,
      amount: result.razorpay.amount,
      currency: result.razorpay.currency,
      name: "KanchKart",
      description: `Order ${result.orderNumber}`,
      order_id: result.razorpay.id,
      prefill: {
        name: payload.address.name,
        email: payload.address.email,
        contact: payload.address.phone
      },
      handler: async (payment: RazorpayPaymentResponse) => {
        const verify = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: result.orderId,
            razorpayOrderId: payment.razorpay_order_id,
            razorpayPaymentId: payment.razorpay_payment_id,
            razorpaySignature: payment.razorpay_signature
          })
        });
        if (verify.ok) {
          clearCart();
          router.push(`/checkout/success/${result.orderNumber}`);
        } else {
          setError("Payment verification failed. Contact support with your order number.");
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => setLoading(false)
      }
    });
    razorpay.open();
  }

  if (!items.length) {
    return (
      <div className="rounded-md border bg-white/70 p-8 text-center">
        <h2 className="font-serif text-3xl font-semibold">Your cart is empty</h2>
        <Button asChild className="mt-5">
          <a href="/shop">Shop now</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-md border bg-white/70 p-5 shadow-sm">
        <h2 className="font-serif text-3xl font-semibold">Delivery details</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="couponCode">Coupon</Label>
            <Input id="couponCode" name="couponCode" />
          </div>
          <div className="sm:col-span-2 grid gap-2">
            <Label>Address search</Label>
            <GoogleAddressAutocomplete onPlace={() => undefined} />
          </div>
          <div className="sm:col-span-2 grid gap-2">
            <Label htmlFor="line1">Address line 1</Label>
            <Input id="line1" name="line1" required />
          </div>
          <div className="sm:col-span-2 grid gap-2">
            <Label htmlFor="line2">Address line 2</Label>
            <Input id="line2" name="line2" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="postalCode">PIN code</Label>
            <Input id="postalCode" name="postalCode" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="landmark">Landmark</Label>
            <Input id="landmark" name="landmark" />
          </div>
        </div>

        <h2 className="mt-8 font-serif text-3xl font-semibold">Payment</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("RAZORPAY")}
            className={`focus-ring rounded-md border p-4 text-left ${paymentMethod === "RAZORPAY" ? "border-gold bg-gold/10" : "bg-white"}`}
          >
            <CreditCard className="h-5 w-5 text-gold" />
            <p className="mt-2 font-semibold">Razorpay</p>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("COD")}
            className={`focus-ring rounded-md border p-4 text-left ${paymentMethod === "COD" ? "border-gold bg-gold/10" : "bg-white"}`}
          >
            <Truck className="h-5 w-5 text-gold" />
            <p className="mt-2 font-semibold">Cash on Delivery</p>
          </button>
        </div>
      </div>

      <aside className="h-fit rounded-md border bg-white/70 p-5 shadow-sm">
        <h2 className="font-serif text-3xl font-semibold">Summary</h2>
        <div className="mt-5 grid gap-3 text-sm">
          {items.map((item) => (
            <p key={`${item.productId}-${item.variantId || "default"}`} className="flex justify-between gap-4">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </p>
          ))}
          <p className="border-t pt-3 flex justify-between">
            <span>Shipping</span>
            <span>{shipping ? formatPrice(shipping) : "Free"}</span>
          </p>
          <p className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </p>
        </div>
        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
        <Button className="mt-6 w-full" variant="gold" disabled={loading}>
          {loading ? "Processing..." : "Place order"}
        </Button>
      </aside>
    </form>
  );
}
