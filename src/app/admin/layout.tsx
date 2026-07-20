import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin | KanchKart",
  description: "Admin panel"
};

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Redirect if not authenticated or not admin
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/account");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-slate-50 p-6">
        <h1 className="text-2xl font-bold mb-8">KanchKart Admin</h1>
        
        <nav className="space-y-2 mb-8">
          <a
            href="/admin"
            className="block px-4 py-2 text-sm font-medium rounded hover:bg-slate-200"
          >
            Dashboard
          </a>
          <a
            href="/admin/products"
            className="block px-4 py-2 text-sm rounded hover:bg-slate-200"
          >
            Products
          </a>
          <a
            href="/admin/orders"
            className="block px-4 py-2 text-sm rounded hover:bg-slate-200"
          >
            Orders
          </a>
          <a
            href="/admin/customers"
            className="block px-4 py-2 text-sm rounded hover:bg-slate-200"
          >
            Customers
          </a>
        </nav>

        <div className="border-t pt-4">
          <p className="text-xs text-slate-600 mb-3">
            Logged in as:<br />
            <strong>{session.user.email}</strong>
          </p>
          <form action={`/api/auth/signout`} method="POST">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
