"use client";

import { useState } from "react";
import Image from "next/image";
import { PackageCheck, Truck, Clock, CheckCircle2, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, toNumber } from "@/lib/money";

type TrackingResult = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number | string;
  trackingNumber?: string | null;
  courierPartner?: string | null;
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

  const statusWorkflow = [
    { key: "ORDER_RECEIVED", label: "Order Received" },
    { key: "CONFIRMED", label: "Accepted (Confirmed)" },
    { key: "PACKED", label: "Ready to Dispatch (Packed)" },
    { key: "DISPATCHED", label: "Dispatched (In Transit)" },
    { key: "DELIVERED", label: "Delivered" }
  ];

  function getStepIndex(currentStatus: string) {
    if (currentStatus === "DELIVERED") return 4;
    if (currentStatus === "DISPATCHED" || currentStatus === "IN_TRANSIT") return 3;
    if (currentStatus === "PACKED") return 2;
    if (currentStatus === "CONFIRMED") return 1;
    return 0;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gold/20 bg-white/90 p-6 shadow-sm">
        <form
          className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setLoading(true);
            const form = new FormData(event.currentTarget);
            const response = await fetch("/api/orders/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderNumber: form.get("orderNumber"),
                email: form.get("email")
              })
            });
            const payload = await response.json();
            setLoading(false);
            if (response.ok) setResult(payload);
            else setError(payload.error || "Order not found. Please check your Order ID and Email.");
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="orderNumber" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Order ID / Number *
            </Label>
            <Input
              id="orderNumber"
              name="orderNumber"
              defaultValue={defaultOrderNumber}
              placeholder="e.g. ord_12345"
              required
              className="bg-white border-gold/20 focus:border-gold font-mono"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-charcoal">
              Email Address *
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. customer@example.com"
              required
              className="bg-white border-gold/20 focus:border-gold"
            />
          </div>
          <Button variant="gold" className="self-end px-8 font-bold" type="submit" disabled={loading}>
            {loading ? "Searching..." : "Track Order"}
          </Button>
        </form>
        {error ? <p className="mt-4 text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-200">{error}</p> : null}
      </div>

      {result ? (
        <div className="rounded-2xl border border-gold/20 bg-white/95 p-6 shadow-md space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gold/15">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-2xl font-bold text-charcoal">Order #{result.orderNumber}</h3>
                <span className="rounded-full bg-gold/20 border border-gold/40 px-3 py-0.5 text-xs font-bold text-charcoal">
                  {result.status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total Paid: <strong className="text-charcoal font-bold">{formatPrice(toNumber(result.grandTotal))}</strong> • Online Prepaid ({result.paymentStatus})</p>
            </div>

            {result.courierPartner ? (
              <div className="text-right text-xs bg-gold/10 border border-gold/30 p-3 rounded-xl">
                <p className="font-bold text-charcoal">{result.courierPartner}</p>
                {result.trackingNumber ? <p className="font-mono text-gold font-semibold">AWB: {result.trackingNumber}</p> : null}
              </div>
            ) : null}
          </div>

          {/* Real-time Order Progress Bar */}
          <div className="py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-gold mb-4">Real-Time Delivery Timeline</p>
            <div className="grid grid-cols-5 gap-2 text-center">
              {statusWorkflow.map((step, index) => {
                const currentIndex = getStepIndex(result.status);
                const isPassed = index <= currentIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? "bg-gold text-charcoal shadow-gold-glow"
                          : "bg-muted text-muted-foreground border border-gold/20"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className={`mt-2 text-[11px] font-semibold leading-tight ${isPassed ? "text-charcoal" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Item Pictures & Details */}
          {result.items && result.items.length > 0 ? (
            <div className="pt-4 border-t border-gold/15">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3">Order Items Recieved ({result.items.length})</p>
              <div className="divide-y divide-gold/10">
                {result.items.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 rounded-lg border border-gold/20 bg-ivory overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-charcoal text-sm">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">SKU: {item.sku}</p>
                        <p className="text-xs text-gold font-semibold">{formatPrice(toNumber(item.unitPrice))} × {item.quantity} qty</p>
                      </div>
                    </div>
                    <p className="font-bold text-charcoal text-sm">{formatPrice(toNumber(item.lineTotal))}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Activity Log */}
          {result.timeline && result.timeline.length > 0 ? (
            <div className="pt-4 border-t border-gold/15">
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3">Activity Status History</p>
              <div className="space-y-2">
                {result.timeline.map((event) => (
                  <div key={event.id} className="border-l-2 border-gold pl-3 py-1 text-xs">
                    <p className="font-bold text-charcoal capitalize">{event.title}</p>
                    {event.description ? <p className="text-muted-foreground">{event.description}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
