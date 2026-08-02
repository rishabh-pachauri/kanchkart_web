import Link from "next/link";
import { CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/money";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({ title: "Order Status" });

export default async function OrderSuccessPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      address: true
    }
  });

  if (!order) {
    return (
      <section className="container max-w-xl py-20 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-rose-600" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Order Not Found</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t find an order matching <code className="font-mono text-charcoal font-bold">{orderNumber}</code>.
        </p>
        <Button asChild variant="gold" className="font-bold">
          <Link href="/shop">Return to Shop</Link>
        </Button>
      </section>
    );
  }

  const isPaid = order.paymentStatus === "PAID";
  const isFailed = order.paymentStatus === "FAILED";

  return (
    <section className="container max-w-2xl py-12 px-4">
      {isPaid ? (
        /* ── Paid & Confirmed State ── */
        <div className="rounded-3xl border border-emerald-200 bg-white/90 p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Payment Confirmed
            </span>
            <h1 className="font-serif text-4xl font-semibold text-charcoal">Order Confirmed!</h1>
            <p className="text-sm text-muted-foreground">
              Thank you for shopping with KanchKart. Order <span className="font-mono font-bold text-charcoal">{order.orderNumber}</span> has been received and is being prepared for dispatch.
            </p>
          </div>

          <div className="rounded-2xl border border-gold/15 bg-ivory/60 p-5 text-left text-sm space-y-3">
            <div className="flex justify-between items-center border-b border-gold/15 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Order Total</span>
              <span className="text-lg font-bold text-amber-900">{formatPrice(order.grandTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Date & Time Placed</span>
              <span className="font-semibold text-charcoal">{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Customer</span>
              <span className="font-medium text-charcoal">{order.customerName} ({order.customerEmail})</span>
            </div>
            {order.address && (
              <div className="flex justify-between items-start text-xs text-muted-foreground pt-1">
                <span>Shipping Address</span>
                <span className="font-medium text-charcoal text-right max-w-[240px]">
                  {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.postalCode}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button asChild variant="gold" className="font-bold">
              <Link href={`/track-order?orderNumber=${orderNumber}`}>Track Order Status</Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      ) : (
        /* ── Pending / Payment Not Confirmed State ── */
        <div className="rounded-3xl border border-amber-300 bg-amber-50/70 p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            {isFailed ? (
              <AlertTriangle className="h-10 w-10 text-rose-600" />
            ) : (
              <Clock className="h-10 w-10 text-amber-600" />
            )}
          </div>

          <div className="space-y-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isFailed ? "bg-rose-100 text-rose-800" : "bg-amber-200 text-amber-900"
            }`}>
              {isFailed ? "Payment Failed" : "Payment Pending"}
            </span>
            <h1 className="font-serif text-4xl font-semibold text-charcoal">
              {isFailed ? "Payment Failed" : "Payment Incomplete"}
            </h1>
            <p className="text-sm text-amber-900/80 max-w-md mx-auto leading-relaxed">
              Order <span className="font-mono font-bold text-charcoal">{order.orderNumber}</span> was created, but payment has not been received yet. Please complete payment to process your order.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-white/90 p-5 text-left text-sm space-y-3">
            <div className="flex justify-between items-center border-b border-amber-100 pb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Amount Payable</span>
              <span className="text-xl font-bold text-amber-900">{formatPrice(order.grandTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Payment Status</span>
              <span className="font-semibold text-amber-800 uppercase">{order.paymentStatus}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Button asChild variant="gold" className="font-bold gap-2 py-6">
              <Link href="/checkout">
                <ShieldCheck className="h-5 w-5" />
                <span>Retry Payment at Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="font-semibold">
              <Link href={`/track-order?orderNumber=${orderNumber}`}>Check Order Status</Link>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
