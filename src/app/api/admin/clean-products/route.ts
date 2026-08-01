import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import path from "path";
import fs from "fs";

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

    // Configure Cloudinary if keys exist
    const hasCloudinary = Boolean(
      env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret
    );

    if (hasCloudinary) {
      cloudinary.config({
        cloud_name: env.cloudinaryCloudName,
        api_key: env.cloudinaryApiKey,
        api_secret: env.cloudinaryApiSecret
      });
    }

    const brainDir = "/Users/admin/.gemini/antigravity/brain/97314eb0-2afe-47f4-a535-97cdd9c2f43f";
    const publicProductsDir = path.join(process.cwd(), "public", "products");

    if (!fs.existsSync(publicProductsDir)) {
      fs.mkdirSync(publicProductsDir, { recursive: true });
    }

    // Copy generated images if brain directory exists
    if (fs.existsSync(brainDir)) {
      try {
        const brainFiles = fs.readdirSync(brainDir);
        brainFiles.forEach((file) => {
          if (file.startsWith("bottle_lifestyle_desk")) {
            fs.copyFileSync(path.join(brainDir, file), path.join(publicProductsDir, "pure-glass-bottle-desk.jpg"));
          } else if (file.startsWith("bottle_macro_cap")) {
            fs.copyFileSync(path.join(brainDir, file), path.join(publicProductsDir, "pure-glass-bottle-macro.jpg"));
          } else if (file.startsWith("bottle_kitchen_counter")) {
            fs.copyFileSync(path.join(brainDir, file), path.join(publicProductsDir, "pure-glass-bottle-kitchen.jpg"));
          }
        });
      } catch (err) {
        console.log("Note: Brain directory copy skipped during cloud runtime:", err);
      }
    }

    // Images definition for the active glass bottle listing
    const imageDefs = [
      {
        name: "cover",
        filename: "pure-glass-water-bottle.jpg",
        fallbackUrl: "/products/pure-glass-water-bottle.jpg"
      },
      {
        name: "desk",
        filename: "pure-glass-bottle-desk.jpg",
        fallbackUrl: "/products/pure-glass-bottle-desk.jpg"
      },
      {
        name: "macro",
        filename: "pure-glass-bottle-macro.jpg",
        fallbackUrl: "/products/pure-glass-bottle-macro.jpg"
      },
      {
        name: "kitchen",
        filename: "pure-glass-bottle-kitchen.jpg",
        fallbackUrl: "/products/pure-glass-bottle-kitchen.jpg"
      }
    ];

    const results = [];

    for (const product of activeProducts) {
      const updatedMediaUrls: { url: string; alt: string; position: number }[] = [];

      for (let i = 0; i < imageDefs.length; i++) {
        const def = imageDefs[i];
        const localPath = path.join(publicProductsDir, def.filename);
        let finalUrl = def.fallbackUrl;

        if (hasCloudinary && fs.existsSync(localPath)) {
          try {
            const uploadRes = await cloudinary.uploader.upload(localPath, {
              folder: env.cloudinaryUploadFolder || "kanchkart/products",
              public_id: `${product.slug}_${def.name}_${Date.now()}`
            });
            finalUrl = uploadRes.secure_url;
          } catch (uploadErr) {
            console.error(`Cloudinary upload error for ${def.filename}:`, uploadErr);
          }
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
      products: results
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Cleanup failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
