import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Collections",
  description: "Explore curated KanchKart glassware collections."
});

export default async function CollectionsPage() {
  const collections = await db.collection.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Collections</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Curated glassware edits</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {collections.map((collection) => (
          <Link
            href={`/collections/${collection.slug}`}
            key={collection.id}
            className="group rounded-md border bg-white/70 p-4 transition hover:shadow-soft"
          >
            <div className="relative aspect-[5/3] overflow-hidden rounded-md bg-secondary">
              <Image
                src={collection.imageUrl || "/brand/hero-glassware.svg"}
                alt={collection.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-4 font-serif text-3xl font-semibold">{collection.name}</h2>
            {collection.description ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{collection.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

