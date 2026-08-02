"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { CreditCard, AlertCircle, ShieldCheck, Tag, CheckCircle2, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { GoogleAddressAutocomplete } from "@/components/checkout/google-address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/money";

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
  const { data: session } = useSession();
  const { items, subtotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

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

  const paymentMethod = "RAZORPAY";
  const shipping = subtotal >= shippingConfig.freeShippingThreshold ? 0 : shippingConfig.defaultShippingCost;
  const discount = appliedCoupon?.discount ?? 0;
  const total = useMemo(
    () => Math.max(0, subtotal + shipping - discount),
    [subtotal, shipping, discount]
  );

  async function applyRazorpay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const getString = (key: string) => (form.get(key) as string) || "";
    const getOptional = (key: string) => {
      const val = form.get(key) as string;
      return val && val.trim() !== "" ? val.trim() : undefined;
    };

    const payload = {
      paymentMethod,
      couponCode: appliedCoupon?.code,
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      })),
      address: {
        name: getString("name"),
        email: getString("email"),
        phone: getString("phone"),
        line1: getString("line1"),
        line2: getOptional("line2"),
        city: getString("city"),
        state: getString("state"),
        postalCode: getString("postalCode"),
        country: "India",
        landmark: getOptional("landmark")
      }
    };

    try {
      const response = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok) {
        setLoading(false);
        setError(result.error || "Checkout creation failed. Please check your address details.");
        return;
      }

      const loaded = await loadRazorpay();
      const RazorpayConstructor = window.Razorpay;
      if (!loaded || !result.razorpay || !RazorpayConstructor) {
        setLoading(false);
        setError("Razorpay SDK could not be loaded. Please check your internet connection and try again.");
        return;
      }

      const razorpay = new RazorpayConstructor({
        key: result.razorpay.key,
        amount: result.razorpay.amount,
        currency: result.razorpay.currency || "INR",
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
            setError("Payment signature verification failed. Please contact support with your order number.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false)
        }
      });
      razorpay.open();
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during checkout.");
    }
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    setAppliedCoupon(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon.");
      } else {
        setAppliedCoupon({ code: data.code, description: data.description, discount: data.discount });
      }
    } catch {
      setCouponError("Could not validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  if (!items.length) {
    return (
      <div className="rounded-md border bg-white/70 p-8 text-center space-y-4">
        <h2 className="font-serif text-3xl font-semibold text-charcoal">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
        <Button asChild variant="gold" className="mt-2 font-bold">
          <Link href="/shop">Explore Glassware Catalog</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={applyRazorpay} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-gold/20 bg-white/90 p-6 shadow-sm space-y-6">
        <h2 className="font-serif text-3xl font-semibold text-charcoal">Delivery details</h2>

        {error ? (
          <div className="flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-700">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider">Checkout Issue</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Full name *
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={session?.user?.name || ""}
              placeholder="e.g. Rahul Sharma"
              required
              className="bg-white border-gold/20 focus:border-gold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Email address *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={session?.user?.email || ""}
              placeholder="e.g. rahul@example.com"
              required
              className="bg-white border-gold/20 focus:border-gold"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Phone number *
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="e.g. +91 98765 43210"
              required
              className="bg-white border-gold/20 focus:border-gold"
            />
          </div>

          {/* ── Coupon Code with Apply Button ── */}
          <div className="grid gap-2">
            <Label htmlFor="couponCode" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Promo Code (Optional)
            </Label>
            {appliedCoupon ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-800">{appliedCoupon.code} applied!</p>
                  <p className="text-xs text-emerald-600 truncate">{appliedCoupon.description}</p>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-emerald-700 hover:text-rose-600 transition-colors ml-1"
                  title="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="couponCode"
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void handleApplyCoupon(); } }}
                  placeholder="e.g. KANCH10"
                  className="bg-white border-gold/20 focus:border-gold uppercase tracking-widest font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 border-gold/40 text-amber-800 hover:bg-gold/10 font-bold px-4"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                >
                  <Tag className="h-4 w-4 mr-1" />
                  {couponLoading ? "..." : "Apply"}
                </Button>
              </div>
            )}
            {couponError && (
              <p className="text-xs text-rose-600 flex items-center gap-1 mt-0.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {couponError}
              </p>
            )}
          </div>

          <div className="sm:col-span-2 grid gap-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-charcoal">Address search</Label>
            <GoogleAddressAutocomplete onPlace={() => undefined} />
          </div>
          <div className="sm:col-span-2 grid gap-2">
            <Label htmlFor="line1" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Address line 1 *
            </Label>
            <Input
              id="line1"
              name="line1"
              placeholder="House/Flat No., Building Name, Street"
              required
              className="bg-white border-gold/20 focus:border-gold"
            />
          </div>
          <div className="sm:col-span-2 grid gap-2">
            <Label htmlFor="line2" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Address line 2 (Optional)
            </Label>
            <Input id="line2" name="line2" placeholder="Apartment, suite, unit, etc." className="bg-white border-gold/20 focus:border-gold" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              City *
            </Label>
            <Input id="city" name="city" placeholder="e.g. Firozabad" required className="bg-white border-gold/20 focus:border-gold" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              State *
            </Label>
            <Input id="state" name="state" placeholder="e.g. Uttar Pradesh" required className="bg-white border-gold/20 focus:border-gold" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="postalCode" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              PIN code *
            </Label>
            <Input id="postalCode" name="postalCode" placeholder="e.g. 283203" required className="bg-white border-gold/20 focus:border-gold" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="landmark" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Landmark (Optional)
            </Label>
            <Input id="landmark" name="landmark" placeholder="e.g. Near Mahaveer Temple" className="bg-white border-gold/20 focus:border-gold" />
          </div>
        </div>

        <h2 className="mt-8 font-serif text-3xl font-semibold text-charcoal">Payment Method</h2>
        <div className="mt-4">
          <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-left shadow-sm">
            <CreditCard className="h-5 w-5 text-gold" />
            <p className="mt-2 font-bold text-charcoal">Prepaid Online Payment (Razorpay / UPI / Cards / NetBanking)</p>
            <p className="mt-1 text-xs text-muted-foreground">100% Secure Payment Processing via Razorpay Payment Gateway</p>
          </div>
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-gold/20 bg-white/90 p-6 shadow-sm space-y-6">
        <h2 className="font-serif text-3xl font-semibold text-charcoal">Order Summary</h2>
        <div className="grid gap-3 text-sm">
          {items.map((item) => (
            <p key={`${item.productId}-${item.variantId || "default"}`} className="flex justify-between gap-4">
              <span className="text-charcoal font-medium">
                {item.name} × {item.quantity}
              </span>
              <span className="font-bold text-charcoal">{formatPrice(item.price * item.quantity)}</span>
            </p>
          ))}

          <p className="border-t border-gold/15 pt-3 flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold text-charcoal">{formatPrice(subtotal)}</span>
          </p>

          <p className="flex justify-between text-muted-foreground">
            <span>Shipping Fee</span>
            <span className="font-semibold text-charcoal">{shipping ? formatPrice(shipping) : "FREE"}</span>
          </p>

          {appliedCoupon && (
            <p className="flex justify-between text-emerald-700 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5" />
                Discount ({appliedCoupon.code})
              </span>
              <span>− {formatPrice(discount)}</span>
            </p>
          )}

          <div className="border-t border-gold/15 pt-3">
            <p className="flex justify-between text-lg font-bold text-charcoal">
              <span>Total Payable</span>
              <span className="text-amber-800">{formatPrice(total)}</span>
            </p>
            {appliedCoupon && (
              <p className="text-xs text-emerald-600 text-right mt-0.5 font-medium">
                You save {formatPrice(discount)} with {appliedCoupon.code} 🎉
              </p>
            )}
          </div>
        </div>

        <Button className="w-full gap-2 py-6 font-bold shadow-md" variant="gold" disabled={loading}>
          <ShieldCheck className="h-5 w-5" />
          <span>{loading ? "Processing..." : "Place Order & Pay"}</span>
        </Button>
      </aside>
    </form>
  );
}
