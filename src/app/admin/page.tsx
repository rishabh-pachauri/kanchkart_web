import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, IndianRupee, PackageCheck, ShoppingCart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export default async function AdminDashboardPage() {
  const [orders, customers, lowStock, revenue] = await Promise.all([
    db.order.count(),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.product.count({ where: { stock: { lte: 5 } } }),
    db.order.aggregate({ _sum: { grandTotal: true }, where: { paymentStatus: { in: ["PAID", "AUTHORIZED"] } } })
  ]);
  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 8
  });
  const metrics: Array<{ label: string; value: string | number; icon: LucideIcon }> = [
    { label: "Revenue", value: formatPrice(revenue._sum.grandTotal), icon: IndianRupee },
    { label: "Orders", value: orders, icon: ShoppingCart },
    { label: "Customers", value: customers, icon: Users },
    { label: "Low stock", value: lowStock, icon: AlertTriangle }
  ];

  return (
    <section className="container py-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-gold">Admin</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Command center</h1>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/products/new">Add product</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-md border bg-white/80 p-5">
            <Icon className="h-5 w-5 text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-md border bg-white/80 p-5">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-gold" />
          <h2 className="font-serif text-3xl font-semibold">Recent orders</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {recentOrders.map((order) => (
            <Link
              href="/admin/orders"
              key={order.id}
              className="flex flex-col justify-between gap-2 rounded-md border bg-ivory p-4 md:flex-row md:items-center"
            >
              <span className="font-medium">{order.orderNumber}</span>
              <span className="text-sm text-muted-foreground">{order.status}</span>
              <span className="font-semibold">{formatPrice(order.grandTotal)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
