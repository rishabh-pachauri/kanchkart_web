import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== "kanchkart-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Delete all inactive products
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

    // Check Cloudinary configuration
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || env.cloudinaryCloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY || env.cloudinaryApiKey;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || env.cloudinaryApiSecret;

    const hasCloudinary = Boolean(cloudName && apiKey && apiSecret);

    if (hasCloudinary) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });
    }

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin || "https://kanchkart.vercel.app";

    // Define relative image paths
    const imageDefs = [
      {
        name: "cover",
        relativePath: "/products/pure-glass-water-bottle.jpg"
      },
      {
        name: "desk",
        relativePath: "/products/pure-glass-bottle-desk.jpg"
      },
      {
        name: "macro",
        relativePath: "/products/pure-glass-bottle-macro.jpg"
      },
      {
        name: "kitchen",
        relativePath: "/products/pure-glass-bottle-kitchen.jpg"
      }
    ];

    const results = [];
    const uploadLogs: string[] = [];

    for (const product of activeProducts) {
      const updatedMediaUrls: { url: string; alt: string; position: number }[] = [];

      for (let i = 0; i < imageDefs.length; i++) {
        const def = imageDefs[i];
        let finalUrl = def.relativePath;

        if (hasCloudinary) {
          const sourceUrl = `${appOrigin}${def.relativePath}`;
          try {
            uploadLogs.push(`Attempting Cloudinary upload from ${sourceUrl}...`);
            const uploadRes = await cloudinary.uploader.upload(sourceUrl, {
              folder: process.env.CLOUDINARY_UPLOAD_FOLDER || env.cloudinaryUploadFolder || "kanchkart/products",
              public_id: `${product.slug}_${def.name}_${Date.now()}`
            });

            if (uploadRes?.secure_url) {
              finalUrl = uploadRes.secure_url;
              uploadLogs.push(`Success: ${finalUrl}`);
            }
          } catch (uploadErr: unknown) {
            const errStr = uploadErr instanceof Error ? uploadErr.message : JSON.stringify(uploadErr);
            uploadLogs.push(`Failed for ${def.name}: ${errStr}`);
          }
        } else {
          uploadLogs.push(`Cloudinary not configured. Missing env variables.`);
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
      cloudName: cloudName || "Not set",
      logs: uploadLogs,
      products: results
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
