import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export default async function AdminAnalyticsPage() {
  const [paidRevenue, pendingOrders, monthlyOrders] = await Promise.all([
    db.order.aggregate({ _sum: { grandTotal: true }, where: { paymentStatus: { in: ["PAID", "AUTHORIZED"] } } }),
    db.order.count({ where: { status: { in: ["ORDER_RECEIVED", "CONFIRMED", "PACKED"] } } }),
    db.order.groupBy({
      by: ["status"],
      _count: { status: true }
    })
  ]);

  return (
    <section className="container py-8">
      <p className="text-sm font-semibold uppercase text-gold">Analytics</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Sales overview</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border bg-white/80 p-5">
          <p className="text-sm text-muted-foreground">Recognized revenue</p>
          <p className="mt-2 text-3xl font-semibold">{formatPrice(paidRevenue._sum.grandTotal)}</p>
        </div>
        <div className="rounded-md border bg-white/80 p-5">
          <p className="text-sm text-muted-foreground">Pending operational orders</p>
          <p className="mt-2 text-3xl font-semibold">{pendingOrders}</p>
        </div>
      </div>
      <div className="mt-8 rounded-md border bg-white/80 p-5">
        <h2 className="font-serif text-3xl font-semibold">Order status mix</h2>
        <div className="mt-5 grid gap-3">
          {monthlyOrders.map((row) => (
            <div key={row.status} className="grid grid-cols-[180px_1fr_auto] items-center gap-3 text-sm">
              <span>{row.status.replaceAll("_", " ")}</span>
              <div className="h-2 rounded-sm bg-secondary">
                <div className="h-2 rounded-sm bg-gold" style={{ width: `${Math.min(100, row._count.status * 12)}%` }} />
              </div>
              <span className="font-semibold">{row._count.status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

