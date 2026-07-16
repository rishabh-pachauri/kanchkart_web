import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export default async function AdminCustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: { orders: { select: { grandTotal: true } }, addresses: { take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="container py-8">
      <p className="text-sm font-semibold uppercase text-gold">Customers</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Customer management</h1>
      <div className="mt-8 overflow-hidden rounded-md border bg-white/80">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Customer</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Lifetime value</th>
              <th className="p-4">City</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t">
                <td className="p-4">
                  <p className="font-medium">{customer.name || "Customer"}</p>
                  <p className="text-xs text-muted-foreground">{customer.email}</p>
                </td>
                <td className="p-4">{customer.orders.length}</td>
                <td className="p-4">
                  {formatPrice(customer.orders.reduce((sum, order) => sum + Number(order.grandTotal), 0))}
                </td>
                <td className="p-4">{customer.addresses[0]?.city || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

