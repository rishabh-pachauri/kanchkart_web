import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";
import { productInclude } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await db.collection.findUnique({ where: { slug } });
  return siteMetadata({
    title: collection?.name || "Collection",
    description: collection?.description || "Curated KanchKart glassware collection.",
    path: `/collections/${slug}`,
    image: collection?.imageUrl || undefined
  });
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = await db.collection.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        include: productInclude,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!collection) notFound();

  return (
    <section className="container py-10 space-y-8">
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl border border-gold/20 shadow-md">
        <Image
          src={collection.imageUrl || "/collections/signature-clear-glass.jpg"}
          alt={collection.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent flex flex-col justify-end p-8">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">Curated Collection</p>
          <h1 className="mt-1 font-serif text-4xl sm:text-5xl font-bold text-white">{collection.name}</h1>
          {collection.description ? (
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-200">{collection.description}</p>
          ) : null}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-serif font-bold text-charcoal mb-4">Collection Products</h2>
        {collection.products.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No active products found in this collection.</p>
        )}
      </div>
    </section>
  );
}
