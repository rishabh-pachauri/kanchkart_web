import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl.replace(/\/$/, "");
  const [products, categories, collections, posts] = await Promise.all([
    db.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
    db.collection.findMany({ select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } })
  ]);

  return [
    "", "shop", "collections", "new-arrivals", "best-sellers", "offers", "about", "blog", "contact"
  ].map((path) => ({
    url: `${base}/${path}`.replace(/\/$/, ""),
    lastModified: new Date()
  }))
    .concat(products.map((item) => ({ url: `${base}/product/${item.slug}`, lastModified: item.updatedAt })))
    .concat(categories.map((item) => ({ url: `${base}/shop?category=${item.slug}`, lastModified: item.updatedAt })))
    .concat(collections.map((item) => ({ url: `${base}/collections/${item.slug}`, lastModified: item.updatedAt })))
    .concat(posts.map((item) => ({ url: `${base}/blog/${item.slug}`, lastModified: item.updatedAt })));
}
