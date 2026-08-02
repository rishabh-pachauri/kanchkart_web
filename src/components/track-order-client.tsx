"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, toNumber, formatDateTime } from "@/lib/money";
import { Calendar, Clock, Search, Truck, Package, ShieldCheck, AlertCircle, ArrowRight } from "lucide-react";

type TrackingResult = {
  isPaymentPending?: boolean;
  orderNumber: string;
  status?: string;
  paymentStatus: string;
  grandTotal: number | string;
  trackingNumber?: string | null;
  courierPartner?: string | null;
  createdAt?: string | Date;
  message?: string;
  timeline?: Array<{
    id: string;
    title: string;
    description?: string | null;
    createdAt?: string;
  }>;
  items?: Array<{
    id: string;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number | string;
    lineTotal: number | string;
    image: string;
  }>;
};

export function TrackOrderClient({ defaultOrderNumber }: { defaultOrderNumber?: string }) {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderNumberInput, setOrderNumberInput] = useState(defaultOrderNumber || "");

  useEffect(() => {
    if (defaultOrderNumber) {
      performTracking(defaultOrderNumber);
    }
  }, [defaultOrderNumber]);

  async function performTracking(orderNum: string) {
    if (!orderNum.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNum.trim()
        })
      });
      const payload = await response.json();
      setLoading(false);
      if (response.ok) {
        setResult(payload);
      } else {
        setError(payload.error || "Order not found. Please check your Order Number.");
        setResult(null);
      }
    } catch {
      setLoading(false);
      setError("Network error while searching for order status.");
      setResult(null);
    }
  }

  const statusWorkflow = [
    { key: "ORDER_RECEIVED", label: "Order Received" },
    { key: "CONFIRMED", label: "Accepted (Confirmed)" },
    { key: "PACKED", label: "Ready to Dispatch (Packed)" },
    { key: "DISPATCHED", label: "Dispatched (In Transit)" },
    { key: "DELIVERED", label: "Delivered" }
  ];

  function getStepIndex(currentStatus?: string) {
    if (!currentStatus) return 0;
    if (currentStatus === "DELIVERED") return 4;
    if (currentStatus === "DISPATCHED" || currentStatus === "IN_TRANSIT") return 3;
    if (currentStatus === "PACKED") return 2;
    if (currentStatus === "CONFIRMED") return 1;
    return 0;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Search Bar */}
      <div className="rounded-2xl border border-amber-200/60 bg-white/95 p-6 shadow-sm">
        <form
          className="grid gap-4 sm:grid-cols-[1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            performTracking(orderNumberInput);
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="orderNumber" className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-amber-600" />
              Order ID / Number *
            </Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="e.g. ord_1234567890"
              required
              className="bg-white border-amber-200 focus:border-amber-500 font-mono text-base py-3"
            />
          </div>
          <Button variant="gold" className="self-end px-8 font-bold py-6 text-slate-950" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Track Order"}
          </Button>
        </form>
        {error ? <p className="mt-4 text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">{error}</p> : null}
      </div>

      {result ? (
        result.isPaymentPending ? (
          /* ── Unpaid / Payment Pending State: Hide Tracking Dashboard ── */
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-8 shadow-sm text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
                Payment Pending ({result.paymentStatus})
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900">Payment Required to Activate Tracking</h3>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                Order <span className="font-mono font-bold text-slate-900">#{result.orderNumber}</span> was created, but payment has not been received yet. Tracking is disabled until payment is verified.
              </p>
              {result.createdAt && (
                <p className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Placed: {formatDateTime(result.createdAt)} • Amount: <strong className="text-slate-900">{formatPrice(toNumber(result.grandTotal))}</strong>
                </p>
              )}
            </div>
            <div className="pt-2 flex justify-center">
              <Button asChild variant="gold" className="font-bold gap-2 py-6 px-8 text-slate-950">
                <Link href="/checkout">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Complete Payment Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* ── Paid / Confirmed State: Full Real-Time Tracking Dashboard ── */
          <div className="rounded-2xl border border-amber-200/60 bg-white/95 p-6 shadow-md space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-amber-100">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-2xl font-bold text-charcoal">Order #{result.orderNumber}</h3>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-3 py-0.5 text-xs font-bold text-emerald-900">
                    {result.status?.replaceAll("_", " ") || "CONFIRMED"}
                  </span>
                </div>
                
                {/* Placed Date & Time Display */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2">
                  {result.createdAt && (
                    <span className="flex items-center gap-1 font-medium text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <strong>Placed On:</strong> {formatDateTime(result.createdAt)}
                    </span>
                  )}
                  <span>Total: <strong className="text-charcoal font-bold">{formatPrice(toNumber(result.grandTotal))}</strong></span>
                  <span className="capitalize">({result.paymentStatus.toLowerCase()})</span>
                </div>
              </div>

              {result.courierPartner ? (
                <div className="text-right text-xs bg-amber-50 border border-amber-200 p-3 rounded-xl">
                  <p className="font-bold text-charcoal">{result.courierPartner}</p>
                  {result.trackingNumber ? <p className="font-mono text-amber-700 font-semibold">AWB: {result.trackingNumber}</p> : null}
                </div>
              ) : null}
            </div>

            {/* Real-time Order Progress Bar */}
            <div className="py-2">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-4 flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                Real-Time Delivery Timeline
              </p>
              <div className="grid grid-cols-5 gap-2 text-center">
                {statusWorkflow.map((step, index) => {
                  const currentIndex = getStepIndex(result.status);
                  const isPassed = index <= currentIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isPassed
                            ? "bg-amber-400 text-slate-950 font-extrabold shadow-md"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className={`mt-2 text-[11px] font-semibold leading-tight ${isPassed ? "text-slate-900" : "text-slate-400"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ordered Item Pictures & Details */}
            {result.items && result.items.length > 0 ? (
              <div className="pt-4 border-t border-amber-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-amber-600" />
                  Ordered Items ({result.items.length})
                </p>
                <div className="divide-y divide-amber-100/60">
                  {result.items.map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">SKU: {item.sku}</p>
                          <p className="text-xs text-amber-800 font-semibold">{formatPrice(toNumber(item.unitPrice))} × {item.quantity} qty</p>
                        </div>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{formatPrice(toNumber(item.lineTotal))}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Activity Log */}
            {result.timeline && result.timeline.length > 0 ? (
              <div className="pt-4 border-t border-amber-100">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">Activity Status History</p>
                <div className="space-y-2">
                  {result.timeline.map((event) => (
                    <div key={event.id} className="border-l-2 border-amber-400 pl-3 py-1 text-xs">
                      <p className="font-bold text-slate-900 capitalize">{event.title}</p>
                      {event.description ? <p className="text-slate-500">{event.description}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )
      ) : null}
    </div>
  );
}
