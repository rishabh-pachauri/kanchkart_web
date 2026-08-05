import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Tag
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard | KanchKart",
  description: "Executive e-commerce admin management suite",
  icons: {
    icon: "/admin-favicon.png",
    shortcut: "/admin-favicon.png",
    apple: "/admin-favicon.png"
  }
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
      label: "Coupons & Offers",
      href: "/admin/coupons",
      icon: Tag
    },
    {
      label: "Customers",
      href: "/admin/customers",
      icon: Users
    },
    {
      label: "CMS & Banners",
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
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 flex flex-col justify-between shadow-2xl print:hidden">
        <div>
          {/* Logo Brand Header */}
          <div className="mb-8 border-b border-slate-800 pb-6">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-105">
                <span className="text-slate-950 font-extrabold text-sm">KC</span>
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>KanchKart</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded font-mono uppercase font-semibold">Pro</span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">Executive Admin Portal</p>
              </div>
            </Link>
          </div>

          {/* Quick Action Button */}
          <div className="mb-6">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/15"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add New Product</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3.5 px-4 py-3 text-sm font-medium text-slate-300 rounded-xl hover:bg-slate-800/80 hover:text-white transition-all group"
                >
                  <Icon className="h-4 w-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Footer Actions */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Logged in as</p>
              <p className="text-xs font-semibold text-white truncate max-w-[150px]">
                {session.user.email}
              </p>
            </div>
            <Link
              href="/"
              target="_blank"
              title="View Storefront"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 transition"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/40 border border-red-900/50 hover:bg-red-900/40 rounded-xl transition text-center"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>KanchKart Storefront Management System</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:border-amber-400/50 hover:text-white transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Live Storefront</span>
            </Link>
          </div>
        </header>

        {/* Workspace Area */}
        <main className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
