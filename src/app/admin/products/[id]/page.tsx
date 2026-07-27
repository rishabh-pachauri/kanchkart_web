import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/product-form";
import { db } from "@/lib/db";

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, collections] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { media: { orderBy: { position: "asc" } } }
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.collection.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!product) {
    notFound();
  }

  return (
    <section className="container max-w-4xl py-8">
      <p className="text-sm font-semibold uppercase text-gold">Products</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Edit Product</h1>
      <p className="mt-1 text-slate-600">Editing {product.name}</p>
      <div className="mt-8">
        <ProductForm product={product} categories={categories} collections={collections} />
      </div>
    </section>
  );
}
