import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/seo";

export const metadata = siteMetadata({
  title: "Blog",
  description: "Glassware care notes, kitchen styling, and KanchKart product guides."
});

export default async function BlogPage() {
  const posts = await db.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" }
  });

  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Journal</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Glassware notes</h1>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="rounded-md border bg-white/70 p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-secondary">
              <Image
                src={post.coverImage || "/brand/pantry-jars.svg"}
                alt={post.title}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <h2 className="mt-4 font-serif text-2xl font-semibold">{post.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

