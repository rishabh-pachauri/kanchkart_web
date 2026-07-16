import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const productInclude = {
  category: true,
  collection: true,
  media: { orderBy: { position: "asc" } },
  reviews: {
    where: { isApproved: true },
    select: { rating: true }
  }
} satisfies Prisma.ProductInclude;

export async function getHomeContent() {
  const [hero, promo, featuredProducts, categories, collections] = await Promise.all([
    db.cmsSection.findUnique({ where: { key: "home-hero" } }),
    db.cmsSection.findUnique({ where: { key: "why-kanchkart" } }),
    db.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    db.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
    db.collection.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 6
    })
  ]);

  return { hero, promo, featuredProducts, categories, collections };
}

export async function getProducts(input?: {
  q?: string;
  category?: string;
  collection?: string;
  sort?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
}) {
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    input?.sort === "price-asc"
      ? { price: "asc" }
      : input?.sort === "price-desc"
        ? { price: "desc" }
        : input?.sort === "newest"
          ? { createdAt: "desc" }
          : { isFeatured: "desc" };

  return db.product.findMany({
    where: {
      isActive: true,
      ...(input?.q
        ? {
            OR: [
              { name: { contains: input.q, mode: "insensitive" } },
              { description: { contains: input.q, mode: "insensitive" } },
              { sku: { contains: input.q, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(input?.category ? { category: { slug: input.category } } : {}),
      ...(input?.collection ? { collection: { slug: input.collection } } : {}),
      ...(input?.bestSeller ? { isBestSeller: true } : {}),
      ...(input?.newArrival ? { isNewArrival: true } : {})
    },
    include: productInclude,
    orderBy,
    take: 48
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, isActive: true },
    include: {
      ...productInclude,
      variants: true
    }
  });
}

export async function getRelatedProducts(productId: string, categoryId: string) {
  return db.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId }
    },
    include: productInclude,
    take: 4
  });
}

export async function getNavigationData() {
  const [categories, collections] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, take: 8 }),
    db.collection.findMany({ where: { isFeatured: true }, orderBy: { name: "asc" }, take: 8 })
  ]);
  return { categories, collections };
}

export async function getBrandSetting() {
  const setting = await db.siteSetting.findUnique({ where: { key: "brand" } });
  return setting?.value as
    | {
        name?: string;
        domain?: string;
        email?: string;
        phone?: string;
        address?: string;
        socials?: Record<string, string>;
      }
    | undefined;
}

