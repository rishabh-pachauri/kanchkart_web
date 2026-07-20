import { auth } from "@/lib/auth";

export const metadata = {
  title: "Dashboard | Admin | KanchKart"
};

export default async function AdminDashboard() {
  const session = await auth();

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Admin"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Orders
            </h3>
            <p className="text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold">
              ₹0
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Products
            </h3>
            <p className="text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Total Customers
            </h3>
            <p className="text-3xl font-bold">
              0
            </p>
          </div>

        </div>

        {/* Content Placeholder */}
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">
            Quick Links
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a href="/admin/products" className="p-4 border rounded-lg hover:bg-muted transition">
              <h3 className="font-medium">Manage Products</h3>
              <p className="text-sm text-muted-foreground mt-1">Add, edit, and manage your products</p>
            </a>
            <a href="/admin/orders" className="p-4 border rounded-lg hover:bg-muted transition">
              <h3 className="font-medium">View Orders</h3>
              <p className="text-sm text-muted-foreground mt-1">Track and manage customer orders</p>
            </a>
            <a href="/admin/customers" className="p-4 border rounded-lg hover:bg-muted transition">
              <h3 className="font-medium">Customers</h3>
              <p className="text-sm text-muted-foreground mt-1">View customer information</p>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
