import { updateOrderStatusAction } from "@/actions/admin-actions";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="container py-8">
      <p className="text-sm font-semibold uppercase text-gold">Orders</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Order management</h1>
      <div className="mt-8 grid gap-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-md border bg-white/80 p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
              <div>
                <h2 className="font-serif text-3xl font-semibold">{order.orderNumber}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.customerName} · {order.customerEmail} · {order.items.length} item(s)
                </p>
              </div>
              <p className="font-semibold">{formatPrice(order.grandTotal)}</p>
            </div>
            <form action={updateOrderStatusAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input type="hidden" name="orderId" value={order.id} />
              <select name="status" defaultValue={order.status} className="focus-ring h-11 rounded-md border bg-white px-3 text-sm">
                {[
                  "ORDER_RECEIVED",
                  "CONFIRMED",
                  "PACKED",
                  "DISPATCHED",
                  "IN_TRANSIT",
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                  "CANCELLED",
                  "REFUNDED"
                ].map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <input
                name="courierPartner"
                defaultValue={order.courierPartner || ""}
                placeholder="Courier"
                className="focus-ring h-11 rounded-md border bg-white px-3 text-sm"
              />
              <input
                name="trackingNumber"
                defaultValue={order.trackingNumber || ""}
                placeholder="Tracking number"
                className="focus-ring h-11 rounded-md border bg-white px-3 text-sm"
              />
              <button className="rounded-md bg-charcoal px-5 text-sm font-semibold text-ivory">Update</button>
            </form>
          </div>
        ))}
      </div>
    </section>
  );
}

