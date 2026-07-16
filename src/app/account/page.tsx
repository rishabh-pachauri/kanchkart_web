import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";

export const metadata = siteMetadata({ title: "My Account" });

export default async function AccountPage() {
  const user = await requireUser();
  const [orders, addresses, wishlist] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    db.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 4 }),
    db.wishlistItem.count({ where: { userId: user.id } })
  ]);

  return (
    <section className="container py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase text-gold">My account</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">{user.name || user.email}</h1>
        </div>
        <form action={logoutAction}>
          <Button variant="outline">Logout</Button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/account/orders" className="rounded-md border bg-white/70 p-5">
          <p className="text-sm text-muted-foreground">Orders</p>
          <p className="mt-2 text-3xl font-semibold">{orders.length}</p>
        </Link>
        <Link href="/wishlist" className="rounded-md border bg-white/70 p-5">
          <p className="text-sm text-muted-foreground">Wishlist</p>
          <p className="mt-2 text-3xl font-semibold">{wishlist}</p>
        </Link>
        <div className="rounded-md border bg-white/70 p-5">
          <p className="text-sm text-muted-foreground">Saved addresses</p>
          <p className="mt-2 text-3xl font-semibold">{addresses.length}</p>
        </div>
      </div>

      <div className="mt-8 rounded-md border bg-white/70 p-5">
        <h2 className="font-serif text-3xl font-semibold">Recent orders</h2>
        <div className="mt-4 grid gap-3">
          {orders.map((order) => (
            <Link
              href={`/track-order?orderNumber=${order.orderNumber}`}
              key={order.id}
              className="flex flex-col justify-between gap-2 rounded-md border bg-ivory p-4 sm:flex-row sm:items-center"
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

