import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Customers | Admin | KanchKart"
};

export default async function CustomersPage() {
  const customers = await db.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: { select: { id: true } },
      addresses: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customers</h1>
        <p className="text-slate-600">Manage and view customer information</p>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-slate-600">No customers yet</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-sm">Name</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Email</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Phone</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Orders</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Addresses</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {customer.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-6 py-4 font-medium text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {customer.orders.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    {customer.addresses.length}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(customer.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
