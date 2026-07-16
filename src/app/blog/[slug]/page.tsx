import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.blogPost.findUnique({ where: { slug } });
  return siteMetadata({
    title: post?.seoTitle || post?.title || "Blog",
    description: post?.seoDesc || post?.excerpt,
    path: `/blog/${slug}`,
    image: post?.coverImage
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await db.blogPost.findFirst({ where: { slug, isPublished: true } });
  if (!post) notFound();

  return (
    <article className="container max-w-3xl py-10">
      <p className="text-sm font-semibold uppercase text-gold">{post.authorName}</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">{post.title}</h1>
      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-md border bg-secondary">
        <Image
          src={post.coverImage || "/brand/pantry-jars.svg"}
          alt={post.title}
          fill
          sizes="768px"
          className="object-cover"
        />
      </div>
      <div className="prose prose-stone mt-8 max-w-none">
        {post.content.split("\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

