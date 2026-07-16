import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";

export const metadata = siteMetadata({ title: "Invoices" });

export default async function AccountInvoicesPage() {
  const user = await requireUser();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Invoices</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Downloads</h1>
      <div className="mt-8 grid gap-3">
        {orders.map((order) => (
          <a
            key={order.id}
            href={`/api/invoices/${order.orderNumber}`}
            className="flex flex-col justify-between gap-2 rounded-md border bg-white/70 p-4 md:flex-row md:items-center"
          >
            <span className="font-medium">{order.orderNumber}</span>
            <span className="text-sm text-muted-foreground">{order.createdAt.toLocaleDateString("en-IN")}</span>
            <span className="font-semibold">{formatPrice(order.grandTotal)}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

