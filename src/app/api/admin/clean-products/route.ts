import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import { BOTTLE_IMAGES_DATA } from "@/lib/bottle-images-data";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== "kanchkart-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Delete all inactive products from database
    const deletedInactive = await db.product.deleteMany({
      where: { isActive: false }
    });

    // 2. Find active products
    const activeProducts = await db.product.findMany({
      where: { isActive: true },
      include: { media: true }
    });

    if (!activeProducts.length) {
      return NextResponse.json({
        success: false,
        message: "No active products found in database."
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

    // 4 Image definitions with embedded base64 Data URIs + fallback local paths
    const imageDefs: Array<{
      name: string;
      b64Data: string;
      fallbackUrl: string;
    }> = [
      {
        name: "cover",
        b64Data: BOTTLE_IMAGES_DATA.cover,
        fallbackUrl: "/products/pure-glass-water-bottle.jpg"
      },
      {
        name: "desk",
        b64Data: BOTTLE_IMAGES_DATA.desk,
        fallbackUrl: "/products/pure-glass-bottle-desk.jpg"
      },
      {
        name: "macro",
        b64Data: BOTTLE_IMAGES_DATA.macro,
        fallbackUrl: "/products/pure-glass-bottle-macro.jpg"
      },
      {
        name: "kitchen",
        b64Data: BOTTLE_IMAGES_DATA.kitchen,
        fallbackUrl: "/products/pure-glass-bottle-kitchen.jpg"
      }
    ];

    const results = [];
    const uploadLogs: string[] = [];

    for (const product of activeProducts) {
      const updatedMediaUrls: { url: string; alt: string; position: number }[] = [];

      for (let i = 0; i < imageDefs.length; i++) {
        const def = imageDefs[i];
        let finalUrl = def.fallbackUrl;

        if (hasCloudinary && def.b64Data) {
          try {
            uploadLogs.push(`Uploading ${def.name} to Cloudinary (${cloudName})...`);
            const uploadRes = await cloudinary.uploader.upload(def.b64Data, {
              folder: process.env.CLOUDINARY_UPLOAD_FOLDER || env.cloudinaryUploadFolder || "kanchkart/products",
              public_id: `${product.slug}_${def.name}_${Date.now()}`
            });

            if (uploadRes?.secure_url) {
              finalUrl = uploadRes.secure_url;
              uploadLogs.push(`Cloudinary Success (${def.name}): ${finalUrl}`);
            }
          } catch (uploadErr: unknown) {
            const errStr = uploadErr instanceof Error ? uploadErr.message : JSON.stringify(uploadErr);
            uploadLogs.push(`Cloudinary upload failed for ${def.name}: ${errStr}`);
          }
        } else {
          uploadLogs.push(`Skipped Cloudinary upload for ${def.name} (hasCloudinary=${hasCloudinary})`);
        }

        updatedMediaUrls.push({
          url: finalUrl,
          alt: `${product.name} - View ${i + 1}`,
          position: i
        });
      }

      // Clear old incorrect media and insert updated media set
      await db.productMedia.deleteMany({
        where: { productId: product.id }
      });

      await db.productMedia.createMany({
        data: updatedMediaUrls.map((m) => ({
          productId: product.id,
          url: m.url,
          alt: m.alt,
          position: m.position
        }))
      });

      results.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        mediaCount: updatedMediaUrls.length,
        mediaUrls: updatedMediaUrls.map((m) => m.url)
      });
    }

    return NextResponse.json({
      success: true,
      deletedInactiveCount: deletedInactive.count,
      activeProductsCount: activeProducts.length,
      cloudinaryConfigured: hasCloudinary,
      cloudName: cloudName,
      logs: uploadLogs,
      products: results
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
