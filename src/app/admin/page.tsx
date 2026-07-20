import { auth } from "@/lib/auth";

export const metadata = {
  title: "Dashboard | Admin | KanchKart"
};

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <div className="p-8">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back, {session?.user?.name || "Admin"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="border rounded-lg p-6 bg-white hover:shadow-lg transition">
            <h3 className="text-sm text-slate-600 mb-2 font-medium">Total Orders</h3>
            <p className="text-3xl font-bold">0</p>
          </div>

          <div className="border rounded-lg p-6 bg-white hover:shadow-lg transition">
            <h3 className="text-sm text-slate-600 mb-2 font-medium">Revenue</h3>
            <p className="text-3xl font-bold">₹0</p>
          </div>

          <div className="border rounded-lg p-6 bg-white hover:shadow-lg transition">
            <h3 className="text-sm text-slate-600 mb-2 font-medium">Products</h3>
            <p className="text-3xl font-bold">0</p>
          </div>

          <div className="border rounded-lg p-6 bg-white hover:shadow-lg transition">
            <h3 className="text-sm text-slate-600 mb-2 font-medium">Customers</h3>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="text-xl font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/products"
              className="p-4 border rounded-lg hover:bg-slate-50 transition"
            >
              <h3 className="font-semibold mb-1">Products</h3>
              <p className="text-sm text-slate-600">Manage your inventory</p>
            </a>

            <a
              href="/admin/orders"
              className="p-4 border rounded-lg hover:bg-slate-50 transition"
            >
              <h3 className="font-semibold mb-1">Orders</h3>
              <p className="text-sm text-slate-600">View customer orders</p>
            </a>

            <a
              href="/admin/customers"
              className="p-4 border rounded-lg hover:bg-slate-50 transition"
            >
              <h3 className="font-semibold mb-1">Customers</h3>
              <p className="text-sm text-slate-600">Manage customers</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
