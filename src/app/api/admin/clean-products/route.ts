import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import { BOTTLE_IMAGES_DATA } from "@/lib/bottle-images-data";
import { GRID_BOTTLE_IMAGES_DATA } from "@/lib/grid-bottle-images-data";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== "kanchkart-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get or create Category
    let category = await db.category.findUnique({
      where: { slug: "glass-bottles" }
    });

    if (!category) {
      category = await db.category.create({
        data: {
          name: "Glass Bottles",
          slug: "glass-bottles",
          description: "Premium borosilicate glass bottles for daily hydration.",
          imageUrl: "/categories/glass-bottles.jpg"
        }
      });
    }

    // Configure Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || env.cloudinaryCloudName || "eeshmj29";
    const apiKey = process.env.CLOUDINARY_API_KEY || env.cloudinaryApiKey || "463272756214982";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || env.cloudinaryApiSecret || "cHFE2NSgzvqdicukkLuczwYuBZw";

    const hasCloudinary = Boolean(cloudName && apiKey && apiSecret);

    if (hasCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });
    }

    // Target slugs to keep
    const slug1 = "pure-glass-textured-water-bottle";
    const slug2 = "500ml-square-check-glass-bottle";

    // 2. Delete ALL other products from database (and their media) to eliminate duplicates
    const deleteResult = await db.product.deleteMany({
      where: {
        slug: { notIn: [slug1, slug2] }
      }
    });

    const uploadLogs: string[] = [];

    // ── Helper to upload image set to Cloudinary ──
    async function uploadImageSet(
      slug: string,
      images: Array<{ name: string; b64Data: string; fallbackUrl: string }>
    ) {
      const mediaList: { url: string; alt: string; position: number }[] = [];

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        let finalUrl = item.fallbackUrl;

        if (hasCloudinary && item.b64Data) {
          try {
            uploadLogs.push(`Uploading ${slug} (${item.name}) to Cloudinary...`);
            const uploadRes = await cloudinary.uploader.upload(item.b64Data, {
              folder: process.env.CLOUDINARY_UPLOAD_FOLDER || env.cloudinaryUploadFolder || "kanchkart/products",
              public_id: `${slug}_${item.name}_${Date.now()}`
            });

            if (uploadRes?.secure_url) {
              finalUrl = uploadRes.secure_url;
              uploadLogs.push(`Success (${item.name}): ${finalUrl}`);
            }
          } catch (err: unknown) {
            const errStr = err instanceof Error ? err.message : JSON.stringify(err);
            uploadLogs.push(`Upload error (${item.name}): ${errStr}`);
          }
        }

        mediaList.push({
          url: finalUrl,
          alt: `${slug} - view ${i + 1}`,
          position: i
        });
      }

      return mediaList;
    }

    // ── Product 1: Pure Glass Textured Water Bottle (750ml, ₹199, MRP ₹299) ──
    const product1Media = await uploadImageSet(slug1, [
      { name: "cover", b64Data: BOTTLE_IMAGES_DATA.cover, fallbackUrl: "/products/pure-glass-water-bottle.jpg" },
      { name: "desk", b64Data: BOTTLE_IMAGES_DATA.desk, fallbackUrl: "/products/pure-glass-bottle-desk.jpg" },
      { name: "macro", b64Data: BOTTLE_IMAGES_DATA.macro, fallbackUrl: "/products/pure-glass-bottle-macro.jpg" },
      { name: "kitchen", b64Data: BOTTLE_IMAGES_DATA.kitchen, fallbackUrl: "/products/pure-glass-bottle-kitchen.jpg" }
    ]);

    const p1 = await db.product.upsert({
      where: { slug: slug1 },
      update: {
        name: "Pure Glass Textured Water Bottle",
        sku: "KK-BTL-PG-199",
        description: "Switch from plastic to pure glass. Crafted from high-grade borosilicate glass, this eco-friendly 750ml water bottle features an elegant textured beaded grip and a leak-proof stainless steel cap. Pure, safe, and sustainable for everyday hydration.",
        shortDescription: "Pure, safe, and sustainable 750ml glass water bottle with stainless steel cap.",
        categoryId: category.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 500,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Pure Glass Textured Water Bottle",
        slug: slug1,
        sku: "KK-BTL-PG-199",
        description: "Switch from plastic to pure glass. Crafted from high-grade borosilicate glass, this eco-friendly 750ml water bottle features an elegant textured beaded grip and a leak-proof stainless steel cap. Pure, safe, and sustainable for everyday hydration.",
        shortDescription: "Pure, safe, and sustainable 750ml glass water bottle with stainless steel cap.",
        categoryId: category.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 500,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p1.id } });
    await db.productMedia.createMany({
      data: product1Media.map((m) => ({ ...m, productId: p1.id }))
    });

    // ── Product 2: 500ml Square Check Glass Bottle (500ml, ₹149, MRP ₹299) ──
    const product2Media = await uploadImageSet(slug2, [
      { name: "banner", b64Data: GRID_BOTTLE_IMAGES_DATA.banner, fallbackUrl: "/products/grid-glass-bottle-banner.jpg" },
      { name: "studio", b64Data: GRID_BOTTLE_IMAGES_DATA.studio, fallbackUrl: "/products/grid-glass-bottle-studio.jpg" },
      { name: "macro", b64Data: GRID_BOTTLE_IMAGES_DATA.macro, fallbackUrl: "/products/grid-glass-bottle-macro.jpg" },
      { name: "desk", b64Data: GRID_BOTTLE_IMAGES_DATA.desk, fallbackUrl: "/products/grid-glass-bottle-desk.jpg" }
    ]);

    const p2 = await db.product.upsert({
      where: { slug: slug2 },
      update: {
        name: "500ml Square Check Glass Bottle",
        sku: "KK-BTL-SQ-500",
        description: "Stay hydrated this summer with our 500ml Square Check Glass Bottle. Crafted from premium, eco-friendly borosilicate glass, this compact travel-friendly bottle features a unique square check lattice pattern for an anti-slip grip and a 100% leak-proof stainless steel cap. Reusable, easy to carry, and built for daily summer hydration.",
        shortDescription: "500ml leak-proof borosilicate glass bottle with square check texture.",
        categoryId: category.id,
        price: 149.00,
        compareAtPrice: 299.00,
        stock: 350,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "500ml Square Check Glass Bottle",
        slug: slug2,
        sku: "KK-BTL-SQ-500",
        description: "Stay hydrated this summer with our 500ml Square Check Glass Bottle. Crafted from premium, eco-friendly borosilicate glass, this compact travel-friendly bottle features a unique square check lattice pattern for an anti-slip grip and a 100% leak-proof stainless steel cap. Reusable, easy to carry, and built for daily summer hydration.",
        shortDescription: "500ml leak-proof borosilicate glass bottle with square check texture.",
        categoryId: category.id,
        price: 149.00,
        compareAtPrice: 299.00,
        stock: 350,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p2.id } });
    await db.productMedia.createMany({
      data: product2Media.map((m) => ({ ...m, productId: p2.id }))
    });

    const activeListings = await db.product.findMany({
      where: { isActive: true },
      include: { media: { orderBy: { position: "asc" } } }
    });

    return NextResponse.json({
      success: true,
      message: "Database cleaned & listings updated successfully!",
      deletedProductsCount: deleteResult.count,
      activeProductsCount: activeListings.length,
      cloudinaryLogs: uploadLogs,
      listings: activeListings.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: `₹${p.price.toString()}`,
        mrp: `₹${p.compareAtPrice?.toString() || ""}`,
        mediaCount: p.media.length,
        media: p.media
      }))
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
