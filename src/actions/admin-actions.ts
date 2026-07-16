"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { cmsSectionSchema, productSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/security";

export async function createProductAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") || "")),
    sku: formData.get("sku"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    categoryId: formData.get("categoryId"),
    collectionId: formData.get("collectionId") || undefined,
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    stock: formData.get("stock"),
    lowStockAt: formData.get("lowStockAt"),
    gstPercent: formData.get("gstPercent"),
    imageUrl: formData.get("imageUrl") || undefined,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isNewArrival: formData.get("isNewArrival") === "on"
  });

  if (!parsed.success) {
    return { error: "Check the product fields and try again." };
  }

  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      sku: parsed.data.sku,
      description: parsed.data.description,
      shortDescription: parsed.data.shortDescription,
      categoryId: parsed.data.categoryId,
      collectionId: parsed.data.collectionId,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice,
      stock: parsed.data.stock,
      lowStockAt: parsed.data.lowStockAt,
      gstPercent: parsed.data.gstPercent,
      isActive: parsed.data.isActive,
      isFeatured: parsed.data.isFeatured,
      isBestSeller: parsed.data.isBestSeller,
      isNewArrival: parsed.data.isNewArrival,
      seoTitle: parsed.data.name,
      seoDesc: parsed.data.shortDescription,
      media: parsed.data.imageUrl
        ? {
            create: {
              url: parsed.data.imageUrl,
              alt: parsed.data.name,
              position: 0
            }
          }
        : undefined
    }
  });

  revalidatePath("/shop");
  redirect(`/admin/products?created=${product.slug}`);
}

const orderStatusSchema = z.object({
  orderId: z.string(),
  status: z.nativeEnum(OrderStatus),
  trackingNumber: z.string().trim().max(120).optional(),
  courierPartner: z.string().trim().max(120).optional()
});

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = orderStatusSchema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    trackingNumber: formData.get("trackingNumber") || undefined,
    courierPartner: formData.get("courierPartner") || undefined
  });

  await db.order.update({
    where: { id: parsed.orderId },
    data: {
      status: parsed.status,
      trackingNumber: parsed.trackingNumber,
      courierPartner: parsed.courierPartner,
      paymentStatus: parsed.status === "DELIVERED" ? PaymentStatus.PAID : undefined,
      trackingEvents: {
        create: {
          status: parsed.status,
          title: parsed.status.replaceAll("_", " ").toLowerCase(),
          description: `Order status updated to ${parsed.status.replaceAll("_", " ")}.`
        }
      }
    }
  });

  revalidatePath("/admin/orders");
}

export async function upsertCmsSectionAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const parsed = cmsSectionSchema.safeParse({
    key: formData.get("key"),
    placement: formData.get("placement"),
    title: formData.get("title"),
    eyebrow: formData.get("eyebrow") || undefined,
    body: formData.get("body") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    videoUrl: formData.get("videoUrl") || undefined,
    ctaLabel: formData.get("ctaLabel") || undefined,
    ctaHref: formData.get("ctaHref") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on"
  });

  if (!parsed.success) return { error: "Check CMS fields and try again." };

  await db.cmsSection.upsert({
    where: { key: parsed.data.key },
    update: parsed.data,
    create: parsed.data
  });

  revalidatePath("/");
  revalidatePath("/admin/cms");
  return { ok: true };
}

