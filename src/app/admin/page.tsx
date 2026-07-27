import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  PlusCircle,
  FileText,
  Settings,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Executive Dashboard | Admin | KanchKart"
};

export default async function AdminDashboard() {
  const session = await auth();

  const [productCount, orderCount, userCount, recentProducts] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
    db.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Store Operations Hub</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-amber-400 font-semibold">{session?.user?.name || "Admin"}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="gold" className="rounded-xl font-bold text-slate-950 shadow-lg shadow-amber-500/20">
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics & Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{productCount}</span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> Live catalog
            </span>
          </div>
          <Link href="/admin/products" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:underline">
            Manage Products <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Total Orders Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{orderCount}</span>
            <span className="text-xs font-semibold text-emerald-400">Processed</span>
          </div>
          <Link href="/admin/orders" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline">
            View Orders <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Customers Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl relative overflow-hidden group hover:border-sky-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</span>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{userCount}</span>
            <span className="text-xs font-semibold text-sky-400">Registered</span>
          </div>
          <Link href="/admin/customers" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:underline">
            Manage Customers <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Revenue Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment Gateway</span>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">Razorpay / COD</span>
          </div>
          <span className="mt-4 inline-block text-xs font-semibold text-purple-400">Active & Ready</span>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
              <PlusCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Add Product</h3>
              <p className="text-xs text-slate-400">Create new item</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Catalog List</h3>
              <p className="text-xs text-slate-400">Manage all items</p>
            </div>
          </Link>

          <Link
            href="/admin/cms"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">CMS & Banners</h3>
              <p className="text-xs text-slate-400">Homepage content</p>
            </div>
          </Link>

          <Link
            href="/admin/settings"
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-amber-500/40 hover:bg-slate-800/80 transition-all group"
          >
            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Store Settings</h3>
              <p className="text-xs text-slate-400">GST & Business info</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Catalog Preview Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Catalog Additions</h2>
            <p className="text-xs text-slate-400">Latest products added to database</p>
          </div>
          <Link href="/admin/products" className="text-xs font-bold text-amber-400 hover:underline">
            View All Products
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No products found. Click "Add Product" to create your first item.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Product Name & SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {recentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{product.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{product.sku}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {product.category?.name || "Uncategorized"}
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-400">
                      ₹{product.price.toString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          product.stock > product.lowStockAt
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-xs font-bold text-amber-400 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
