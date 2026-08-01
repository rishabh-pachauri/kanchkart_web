import Link from "next/link";
import { PlusCircle, Package, Edit, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { CleanProductsButton } from "@/components/admin/clean-products-button";

export const metadata = {
  title: "Products Inventory | Admin | KanchKart"
};

export default async function ProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Product Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">Manage and track your glassware store inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <CleanProductsButton />
          <Button asChild variant="gold" className="rounded-xl font-bold text-slate-950 shadow-lg shadow-amber-500/20">
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-16 text-center">
          <Package className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
          <p className="text-slate-400 text-sm mb-6">Start by adding your first glassware item to the catalog.</p>
          <Button asChild variant="gold" className="rounded-xl font-bold text-slate-950">
            <Link href="/admin/products/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Create First Product
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900 text-slate-400 uppercase text-[11px] tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white text-base">{product.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-xs text-slate-400 font-mono">/{product.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-300">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-amber-400">
                      ₹{product.price.toString()}
                      {product.compareAtPrice ? (
                        <span className="block text-xs font-normal text-slate-400 line-through">
                          ₹{product.compareAtPrice.toString()}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          product.stock > product.lowStockAt
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <span className="h-2 w-2 rounded-full bg-slate-500" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/product/${product.slug}`}
                          target="_blank"
                          title="View on Storefront"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 transition"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-500 hover:text-slate-950 transition"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
