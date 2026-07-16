import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.collection.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <section className="container max-w-4xl py-8">
      <p className="text-sm font-semibold uppercase text-gold">Products</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Add product</h1>
      <div className="mt-8">
        <ProductForm categories={categories} collections={collections} />
      </div>
    </section>
  );
}

