import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true, media: { take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="container py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-gold">Products</p>
          <h1 className="mt-2 font-serif text-5xl font-semibold">Catalog</h1>
        </div>
        <Button asChild variant="gold">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add
          </Link>
        </Button>
      </div>
      <div className="mt-8 overflow-hidden rounded-md border bg-white/80">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-secondary text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={product.media[0]?.url || "/brand/drinkware.svg"}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">{product.category.name}</td>
                <td className="p-4">{formatPrice(product.price)}</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4">{product.isActive ? "Active" : "Hidden"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

