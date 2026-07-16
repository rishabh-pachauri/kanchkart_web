"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TrackingResult = {
  orderNumber: string;
  status: string;
  timeline?: Array<{
    id: string;
    title: string;
    description?: string | null;
  }>;
};

export function TrackOrderClient({ defaultOrderNumber }: { defaultOrderNumber?: string }) {
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="rounded-md border bg-white/70 p-5 shadow-sm">
      <form
        className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);
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
          if (response.ok) setResult(payload);
          else setError(payload.error || "Order not found.");
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="orderNumber">Order ID</Label>
          <Input id="orderNumber" name="orderNumber" defaultValue={defaultOrderNumber} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Button className="self-end" type="submit">
          Track
        </Button>
      </form>
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
      {result ? (
        <div className="mt-6 rounded-md border bg-ivory p-5">
          <div className="flex items-center gap-3">
            <PackageCheck className="h-6 w-6 text-gold" />
            <div>
              <p className="font-semibold">{result.status}</p>
              <p className="text-sm text-muted-foreground">{result.orderNumber}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {result.timeline?.map((event) => (
              <div key={event.id} className="border-l-2 border-gold/40 pl-4">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
