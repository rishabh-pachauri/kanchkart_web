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
    collectionId: formData.get("collectionId"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    stock: formData.get("stock"),
    lowStockAt: formData.get("lowStockAt"),
    gstPercent: formData.get("gstPercent"),
    imageUrl: formData.get("imageUrl"),
    additionalImages: formData.get("additionalImages"),
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isNewArrival: formData.get("isNewArrival") === "on"
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Check the product fields and try again.";
    return { error: firstError };
  }

  const primaryImage = parsed.data.imageUrl;
  const extraImages = (parsed.data.additionalImages || "")
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean);

  const allImages = [
    ...(primaryImage ? [primaryImage] : []),
    ...extraImages.filter((img) => img !== primaryImage)
  ];

  let createdProductSlug: string;

  try {
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
        media: allImages.length > 0
          ? {
              create: allImages.map((url, index) => ({
                url,
                alt: `${parsed.data.name} image ${index + 1}`,
                position: index
              }))
            }
          : undefined
      }
    });
    createdProductSlug = product.slug;
  } catch (err: unknown) {
    const errorMsg = String(err);
    if (errorMsg.includes("P2002") || errorMsg.includes("Unique constraint")) {
      return { error: "A product with this SKU or Name/Slug already exists." };
    }
    return { error: "Failed to create product in database. Please check fields and try again." };
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect(`/admin/products?created=${createdProductSlug}`);
}

export async function updateProductAction(_: unknown, formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Product ID is missing." };

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(String(formData.get("name") || "")),
    sku: formData.get("sku"),
    description: formData.get("description"),
    shortDescription: formData.get("shortDescription"),
    categoryId: formData.get("categoryId"),
    collectionId: formData.get("collectionId"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    stock: formData.get("stock"),
    lowStockAt: formData.get("lowStockAt"),
    gstPercent: formData.get("gstPercent"),
    imageUrl: formData.get("imageUrl"),
    additionalImages: formData.get("additionalImages"),
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    isBestSeller: formData.get("isBestSeller") === "on",
    isNewArrival: formData.get("isNewArrival") === "on"
  });

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Check the product fields and try again.";
    return { error: firstError };
  }

  const primaryImage = parsed.data.imageUrl;
  const extraImages = (parsed.data.additionalImages || "")
    .split(/[\n,]/)
    .map((url) => url.trim())
    .filter(Boolean);

  const allImages = [
    ...(primaryImage ? [primaryImage] : []),
    ...extraImages.filter((img) => img !== primaryImage)
  ];

  try {
    await db.product.update({
      where: { id },
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
        seoDesc: parsed.data.shortDescription
      }
    });

    if (allImages.length > 0) {
      await db.productMedia.deleteMany({ where: { productId: id } });
      await db.productMedia.createMany({
        data: allImages.map((url, index) => ({
          productId: id,
          url,
          alt: `${parsed.data.name} image ${index + 1}`,
          position: index
        }))
      });
    }
  } catch (err: unknown) {
    const errorMsg = String(err);
    if (errorMsg.includes("P2002") || errorMsg.includes("Unique constraint")) {
      return { error: "A product with this SKU or Name/Slug already exists." };
    }
    return { error: "Failed to update product in database." };
  }

  revalidatePath("/shop");
  revalidatePath("/admin/products");
  redirect("/admin/products?updated=true");
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

const bulkOrderStatusSchema = z.object({
  orderIds: z.array(z.string()).min(1),
  status: z.nativeEnum(OrderStatus)
});

export async function bulkUpdateOrderStatusAction(orderIds: string[], status: OrderStatus) {
  await requireAdmin();
  const parsed = bulkOrderStatusSchema.parse({ orderIds, status });

  await db.$transaction(
    parsed.orderIds.map((id) =>
      db.order.update({
        where: { id },
        data: {
          status: parsed.status,
          paymentStatus: parsed.status === "DELIVERED" ? PaymentStatus.PAID : undefined,
          trackingEvents: {
            create: {
              status: parsed.status,
              title: parsed.status.replaceAll("_", " ").toLowerCase(),
              description: `Order status updated to ${parsed.status.replaceAll("_", " ")}.`
            }
          }
        }
      })
    )
  );

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

