import Link from "next/link";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Orders | Admin | KanchKart"
};

export default async function OrdersPage() {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const statusColors: Record<string, string> = {
    ORDER_RECEIVED: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PACKED: "bg-yellow-100 text-yellow-700",
    DISPATCHED: "bg-purple-100 text-purple-700",
    IN_TRANSIT: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-700"
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-slate-600">Track and manage customer orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-slate-600">No orders yet</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-sm">Order ID</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Customer</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Total</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Payment</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Date</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono text-sm font-medium">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{order.customerName}</p>
                    <p className="text-sm text-slate-600">{order.customerEmail}</p>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ₹{order.grandTotal.toString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        statusColors[order.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </Link>
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
