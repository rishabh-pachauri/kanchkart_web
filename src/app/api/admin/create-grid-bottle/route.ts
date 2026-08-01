import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import { GRID_BOTTLE_IMAGES_DATA } from "@/lib/grid-bottle-images-data";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== "kanchkart-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get or create "Glass Bottles" category
    let category = await db.category.findUnique({
      where: { slug: "glass-bottles" }
    });

    if (!category) {
      category = await db.category.create({
        data: {
          name: "Glass Bottles",
          slug: "glass-bottles",
          description: "Premium borosilicate bottles for daily hydration.",
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

    // Define the 4 images
    const imageDefs = [
      {
        name: "studio",
        b64Data: GRID_BOTTLE_IMAGES_DATA.studio,
        fallbackUrl: "/products/grid-glass-bottle-studio.jpg"
      },
      {
        name: "banner",
        b64Data: GRID_BOTTLE_IMAGES_DATA.banner,
        fallbackUrl: "/products/grid-glass-bottle-banner.jpg"
      },
      {
        name: "macro",
        b64Data: GRID_BOTTLE_IMAGES_DATA.macro,
        fallbackUrl: "/products/grid-glass-bottle-macro.jpg"
      },
      {
        name: "desk",
        b64Data: GRID_BOTTLE_IMAGES_DATA.desk,
        fallbackUrl: "/products/grid-glass-bottle-desk.jpg"
      }
    ];

    const slug = "grid-embossed-500ml-glass-water-bottle";
    const uploadLogs: string[] = [];
    const mediaList: { url: string; alt: string; position: number }[] = [];

    for (let i = 0; i < imageDefs.length; i++) {
      const def = imageDefs[i];
      let finalUrl = def.fallbackUrl;

      if (hasCloudinary && def.b64Data) {
        try {
          uploadLogs.push(`Uploading ${def.name} to Cloudinary...`);
          const uploadRes = await cloudinary.uploader.upload(def.b64Data, {
            folder: process.env.CLOUDINARY_UPLOAD_FOLDER || env.cloudinaryUploadFolder || "kanchkart/products",
            public_id: `${slug}_${def.name}_${Date.now()}`
          });

          if (uploadRes?.secure_url) {
            finalUrl = uploadRes.secure_url;
            uploadLogs.push(`Success (${def.name}): ${finalUrl}`);
          }
        } catch (uploadErr: unknown) {
          const errStr = uploadErr instanceof Error ? uploadErr.message : JSON.stringify(uploadErr);
          uploadLogs.push(`Failed for ${def.name}: ${errStr}`);
        }
      }

      mediaList.push({
        url: finalUrl,
        alt: `Grid Embossed 500ml Glass Water Bottle - View ${i + 1}`,
        position: i
      });
    }

    // Upsert the Product listing
    const product = await db.product.upsert({
      where: { slug },
      update: {
        name: "Grid Embossed 500ml Glass Water Bottle",
        sku: "KK-BTL-GRID-500",
        description: "Stay hydrated in style with our 500ml Grid Embossed Glass Water Bottle. Crafted from thick, eco-friendly borosilicate glass, this travel-friendly bottle features an ergonomic waffle grid texture for a firm non-slip grip and a leak-proof stainless steel cap. Pure, safe, and reusable for daily hydration at work, gym, or home.",
        shortDescription: "500ml leak-proof borosilicate glass bottle with ergonomic grid waffle texture.",
        categoryId: category.id,
        price: 249.00,
        compareAtPrice: 399.00,
        stock: 350,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        seoTitle: "500ml Grid Embossed Glass Water Bottle | KanchKart",
        seoDesc: "Buy 500ml grid embossed borosilicate glass water bottle with leak-proof stainless steel cap."
      },
      create: {
        name: "Grid Embossed 500ml Glass Water Bottle",
        slug,
        sku: "KK-BTL-GRID-500",
        description: "Stay hydrated in style with our 500ml Grid Embossed Glass Water Bottle. Crafted from thick, eco-friendly borosilicate glass, this travel-friendly bottle features an ergonomic waffle grid texture for a firm non-slip grip and a leak-proof stainless steel cap. Pure, safe, and reusable for daily hydration at work, gym, or home.",
        shortDescription: "500ml leak-proof borosilicate glass bottle with ergonomic grid waffle texture.",
        categoryId: category.id,
        price: 249.00,
        compareAtPrice: 399.00,
        stock: 350,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true,
        seoTitle: "500ml Grid Embossed Glass Water Bottle | KanchKart",
        seoDesc: "Buy 500ml grid embossed borosilicate glass water bottle with leak-proof stainless steel cap."
      }
    });

    // Replace product media
    await db.productMedia.deleteMany({
      where: { productId: product.id }
    });

    await db.productMedia.createMany({
      data: mediaList.map((m) => ({
        productId: product.id,
        url: m.url,
        alt: m.alt,
        position: m.position
      }))
    });

    const refreshed = await db.product.findUnique({
      where: { id: product.id },
      include: { media: { orderBy: { position: "asc" } } }
    });

    return NextResponse.json({
      success: true,
      message: "Successfully created Grid Embossed 500ml Glass Water Bottle listing!",
      product: {
        id: refreshed?.id,
        name: refreshed?.name,
        slug: refreshed?.slug,
        sku: refreshed?.sku,
        price: refreshed?.price,
        media: refreshed?.media
      },
      cloudinaryLogs: uploadLogs
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Creation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
