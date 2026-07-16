import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";

export const metadata = siteMetadata({ title: "Order History" });

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Orders</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Order history</h1>
      <div className="mt-8 grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/track-order?orderNumber=${order.orderNumber}`} className="rounded-md border bg-white/70 p-5">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <h2 className="font-serif text-2xl font-semibold">{order.orderNumber}</h2>
              <p className="font-semibold">{formatPrice(order.grandTotal)}</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.items.length} item(s) · {order.status}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

