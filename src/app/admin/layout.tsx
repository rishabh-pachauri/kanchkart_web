import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  Settings
} from "lucide-react";
import Link from "next/link";

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

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard
    },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package
    },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users
    },
    {
      label: "CMS & Content",
      href: "/admin/cms",
      icon: FileText
    },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: Settings
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 shadow-sm">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gold flex items-center justify-center">
              <span className="text-white font-bold text-sm">KC</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">KanchKart</h1>
              <p className="text-xs text-slate-600">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 mb-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-600 mb-3">Logged in as:</p>
          <p className="text-sm font-medium text-slate-900 mb-4 truncate">
            {session.user.email}
          </p>

          <form action={`/api/auth/signout`} method="POST">
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left font-medium"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
