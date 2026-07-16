import { db } from "@/lib/db";

export default async function AdminInventoryPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    orderBy: [{ stock: "asc" }, { name: "asc" }],
    take: 100
  });

  return (
    <section className="container py-8">
      <p className="text-sm font-semibold uppercase text-gold">Inventory</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Stock control</h1>
      <div className="mt-8 grid gap-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-md border bg-white/80 p-4">
            <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
              </div>
              <div className="text-sm">
                <span className={product.stock <= product.lowStockAt ? "font-semibold text-destructive" : "font-semibold"}>
                  {product.stock}
                </span>{" "}
                in stock · alert at {product.lowStockAt}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

