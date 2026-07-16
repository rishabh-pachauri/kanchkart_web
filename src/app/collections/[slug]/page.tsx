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
    image: collection?.imageUrl
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
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Collection</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">{collection.name}</h1>
      {collection.description ? (
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{collection.description}</p>
      ) : null}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {collection.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

