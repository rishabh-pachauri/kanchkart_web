import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Products | Admin | KanchKart"
};

export default async function ProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Products</h1>
          <p className="text-slate-600">Manage your product inventory</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/products/add">Add Product</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-slate-600 mb-4">No products yet</p>
          <Button asChild variant="outline">
            <Link href="/admin/products/add">Create First Product</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-sm">Name</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Category</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Price</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Stock</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Status</th>
                <th className="text-left px-6 py-4 font-semibold text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.sku}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.category.name}
                  </td>
                  <td className="px-6 py-4 font-medium">₹{product.price.toString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        product.stock > product.lowStockAt
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.isActive ? (
                      <span className="text-sm text-green-700">Active</span>
                    ) : (
                      <span className="text-sm text-gray-500">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:underline text-sm"
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
  );
}
