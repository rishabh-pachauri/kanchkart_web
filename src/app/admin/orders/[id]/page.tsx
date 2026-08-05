import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Printer, Package, MapPin, CreditCard } from "lucide-react";
import { updateOrderStatusAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/db";
import { formatPrice, toNumber, formatDateTime } from "@/lib/money";

export const metadata = {
  title: "Order Details | Admin Portal | KanchKart"
};

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              media: true
            }
          }
        }
      },
      address: true,
      payments: true,
      trackingEvents: {
        orderBy: { happenedAt: "desc" }
      }
    }
  });

  if (!order) notFound();

  const primaryPayment = order.payments[0];

  const statusWorkflow = [
    { key: "ORDER_RECEIVED", label: "Order Received" },
    { key: "CONFIRMED", label: "Accepted" },
    { key: "PACKED", label: "Ready to Dispatch (Packed)" },
    { key: "DISPATCHED", label: "Dispatched (In Transit)" },
    { key: "DELIVERED", label: "Delivered" }
  ];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:border-amber-400 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white font-mono">Order #{order.orderNumber}</h1>
              <span
                className={`px-3 py-1 text-xs font-bold rounded-full ${
                  order.status === "DELIVERED"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                    : order.status === "DISPATCHED"
                    ? "bg-purple-950 text-purple-400 border border-purple-800"
                    : order.status === "PACKED"
                    ? "bg-amber-950 text-amber-400 border border-amber-800"
                    : "bg-blue-950 text-blue-400 border border-blue-800"
                }`}
              >
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Placed on {formatDateTime(order.createdAt)} • {order.items.length} items
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Print Shipping Label Link */}
          <Link
            href={`/api/admin/orders/${order.id}/label`}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-400 hover:text-slate-950 transition shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Generate Shipping Label</span>
          </Link>
        </div>
      </div>

      {/* Admin Order Status Update Workflow Form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Package className="h-4 w-4 text-amber-400" />
          Update Order Workflow Status & Tracking
        </h2>

        <form action={updateOrderStatusAction} className="grid gap-6 md:grid-cols-[1.2fr_1fr_1fr_auto] items-end pt-2">
          <input type="hidden" name="orderId" value={order.id} />

          <div className="grid gap-2">
            <Label htmlFor="status" className="text-xs text-slate-300 font-semibold">Change Workflow Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={order.status}
              className="h-10 rounded-lg border border-slate-800 bg-slate-950 px-3 text-sm text-white font-semibold focus:border-amber-400 outline-none"
            >
              <option value="ORDER_RECEIVED">Order Received</option>
              <option value="CONFIRMED">Accept Order (Confirmed)</option>
              <option value="PACKED">Ready to Dispatch (Packed)</option>
              <option value="DISPATCHED">Dispatched / In Transit</option>
              <option value="DELIVERED">Delivered to Customer</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="courierPartner" className="text-xs text-slate-300 font-semibold">Courier Partner Name</Label>
            <Input
              id="courierPartner"
              name="courierPartner"
              defaultValue={order.courierPartner || "Delhivery / BlueDart"}
              placeholder="e.g. Delhivery, BlueDart, DTDC"
              className="bg-slate-950 border-slate-800 text-white focus:border-amber-400"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="trackingNumber" className="text-xs text-slate-300 font-semibold">AWB Tracking Number</Label>
            <Input
              id="trackingNumber"
              name="trackingNumber"
              defaultValue={order.trackingNumber || ""}
              placeholder="e.g. AWB987654321"
              className="bg-slate-950 border-slate-800 text-white focus:border-amber-400 font-mono text-xs"
            />
          </div>

          <Button type="submit" variant="gold" className="h-10 px-6 font-bold shadow-md">
            Update Status
          </Button>
        </form>

        {/* Quick Status Action Buttons */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center font-medium mr-2">Quick Actions:</span>
          {statusWorkflow.map((step) => (
            <form key={step.key} action={updateOrderStatusAction} className="inline-block">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="status" value={step.key} />
              <button
                type="submit"
                disabled={order.status === step.key}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  order.status === step.key
                    ? "border-amber-400/50 bg-amber-400/20 text-amber-400 cursor-default"
                    : "border-slate-800 bg-slate-950 text-slate-300 hover:border-amber-400 hover:text-white"
                }`}
              >
                {step.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Ordered Items List with Pictures */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Ordered Items & Pictures</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
              {order.items.length} items
            </span>
          </h2>

          <div className="divide-y divide-slate-800">
            {order.items.map((item) => {
              const itemImage =
                item.product?.media[0]?.url || "/brand/drinkware.svg";

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Item Picture */}
                    <div className="relative h-16 w-16 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shrink-0 shadow-md">
                      <Image
                        src={itemImage}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <Link
                        href={`/product/${item.product?.slug || ""}`}
                        className="font-serif text-base font-bold text-white hover:text-amber-400 transition"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        SKU: {item.sku}
                      </p>
                      <p className="text-xs text-amber-400 font-semibold mt-1">
                        {formatPrice(toNumber(item.unitPrice))} × {item.quantity} units
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-white text-base">
                      {formatPrice(toNumber(item.lineTotal))}
                    </p>
                    <p className="text-[11px] text-slate-400">Inclusive of GST</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Calculation Summary */}
          <div className="pt-6 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-slate-200 font-semibold">{formatPrice(toNumber(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Shipping Fee</span>
              <span className="text-slate-200 font-semibold">
                {toNumber(order.shippingTotal) === 0 ? "FREE" : formatPrice(toNumber(order.shippingTotal))}
              </span>
            </div>
            {toNumber(order.discountTotal) > 0 ? (
              <div className="flex justify-between text-emerald-400">
                <span>Discount Applied</span>
                <span className="font-semibold">-{formatPrice(toNumber(order.discountTotal))}</span>
              </div>
            ) : null}
            <div className="flex justify-between pt-3 border-t border-slate-800 text-lg font-bold text-white">
              <span>Grand Total</span>
              <span className="text-amber-400">{formatPrice(toNumber(order.grandTotal))}</span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Address Info */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-amber-400" />
              Customer & Delivery Address
            </h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-medium">Customer Name</p>
                <p className="font-bold text-white text-base">{order.customerName}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">Email Address</p>
                <a href={`mailto:${order.customerEmail}`} className="text-amber-400 hover:underline font-semibold">
                  {order.customerEmail}
                </a>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-medium">Phone Number</p>
                <a href={`tel:${order.customerPhone}`} className="text-amber-400 hover:underline font-semibold">
                  {order.customerPhone}
                </a>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs text-slate-400 font-medium mb-1">Shipping Address</p>
                {order.address ? (
                  <div className="text-slate-200 leading-relaxed text-xs space-y-0.5">
                    <p className="font-semibold text-white">{order.address.name}</p>
                    <p>{order.address.line1}</p>
                    {order.address.line2 ? <p>{order.address.line2}</p> : null}
                    <p>
                      {order.address.city}, {order.address.state} - {order.address.postalCode}
                    </p>
                    <p className="text-slate-400 font-semibold">{order.address.country}</p>
                  </div>
                ) : (
                  <p className="text-slate-300 text-xs">Standard Delivery Address configured during checkout.</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Gateway Info */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-amber-400" />
              Payment Gateway Info
            </h2>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded ${order.paymentStatus === "PAID" ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-400"}`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-semibold text-white">{order.paymentMethod} (Razorpay Online)</span>
              </div>
              {primaryPayment?.razorpayPaymentId ? (
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Razorpay Payment ID:</span>
                  <span className="font-mono text-amber-400">{primaryPayment.razorpayPaymentId}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
