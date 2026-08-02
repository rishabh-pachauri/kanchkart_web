import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";
import { BOTTLE_IMAGES_DATA } from "@/lib/bottle-images-data";
import { GRID_BOTTLE_IMAGES_DATA } from "@/lib/grid-bottle-images-data";
import { BEER_MUG_IMAGES_DATA } from "@/lib/beer-mug-images-data";
import { TWISTED_BOTTLE_IMAGES_DATA } from "@/lib/twisted-bottle-images-data";
import { MASON_JAR_IMAGES_DATA } from "@/lib/mason-jar-images-data";
import { MATKI_JAR_IMAGES_DATA } from "@/lib/matki-jar-images-data";
import { RIBBED_JAR_IMAGES_DATA } from "@/lib/ribbed-jar-images-data";
import { SQUARE_CHECK_1L_IMAGES_DATA } from "@/lib/square-check-1l-images-data";
import { ROUND_RIBBED_750_IMAGES_DATA } from "@/lib/round-ribbed-750-images-data";
import { JARS_550ML_IMAGES_DATA } from "@/lib/jars-550ml-images-data";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== "kanchkart-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Get or create Categories
    let bottleCategory = await db.category.findUnique({
      where: { slug: "glass-bottles" }
    });

    if (!bottleCategory) {
      bottleCategory = await db.category.create({
        data: {
          name: "Glass Bottles",
          slug: "glass-bottles",
          description: "Premium borosilicate glass bottles for daily hydration.",
          imageUrl: "/categories/glass-bottles.jpg"
        }
      });
    }

    let drinkwareCategory = await db.category.findUnique({
      where: { slug: "drinkware" }
    });

    if (!drinkwareCategory) {
      drinkwareCategory = await db.category.create({
        data: {
          name: "Drinkware",
          slug: "drinkware",
          description: "Clear glass cups, mugs, tumblers, and everyday drinkware.",
          imageUrl: "/categories/drinkware.jpg"
        }
      });
    }

    let storageCategory = await db.category.findUnique({
      where: { slug: "storage-jars" }
    });

    if (!storageCategory) {
      storageCategory = await db.category.create({
        data: {
          name: "Storage Jars",
          slug: "storage-jars",
          description: "Airtight glass jars for refined kitchens and pantries.",
          imageUrl: "/categories/storage-jars.jpg"
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
    const slug3 = "heavy-glass-classic-beer-mug-450ml";
    const slug4 = "premium-twisted-wave-glass-water-bottle";
    const slug5 = "glass-mason-jar-mug-with-black-lid-450ml";
    const slug6 = "floral-embossed-glass-matki-jars-350ml-pack-of-2";
    const slug7 = "premium-ribbed-glass-storage-jars-300ml-pack-of-2";
    const slug8 = "1-liter-square-check-glass-water-bottle";
    const slug9 = "premium-round-spiral-ribbed-glass-bottle-750ml";
    const slug10 = "round-glass-storage-jars-550ml-pack-of-2";

    // 2. Delete ALL other products from database (and their media) to eliminate duplicates
    const deleteResult = await db.product.deleteMany({
      where: {
        slug: { notIn: [slug1, slug2, slug3, slug4, slug5, slug6, slug7, slug8, slug9, slug10] }
      }
    });

    const uploadLogs: string[] = [];

    // Helper to upload image set to Cloudinary
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
        categoryId: bottleCategory.id,
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
        categoryId: bottleCategory.id,
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
        categoryId: bottleCategory.id,
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
        categoryId: bottleCategory.id,
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

    // ── Product 3: Heavy Glass Classic Beer Mug (450ml, ₹149, MRP ₹299) ──
    const product3Media = await uploadImageSet(slug3, [
      { name: "banner", b64Data: BEER_MUG_IMAGES_DATA.banner, fallbackUrl: "/products/beer-mug-banner.jpg" },
      { name: "studio", b64Data: BEER_MUG_IMAGES_DATA.studio, fallbackUrl: "/products/beer-mug-studio.jpg" },
      { name: "macro", b64Data: BEER_MUG_IMAGES_DATA.macro, fallbackUrl: "/products/beer-mug-macro.jpg" },
      { name: "bar", b64Data: BEER_MUG_IMAGES_DATA.bar, fallbackUrl: "/products/beer-mug-bar.jpg" }
    ]);

    const p3 = await db.product.upsert({
      where: { slug: slug3 },
      update: {
        name: "Heavy Glass Classic Beer Mug (450ml)",
        sku: "KK-MUG-BEER-450",
        description: "Elevate your draught beer experience with our Heavy Glass Classic Beer Mug (450ml). Built with thick, durable soda-lime glass, an ergonomic sturdy handle, and a crystal clear oval cut pattern for superior clarity. Engineered for long-lasting durability, dishwasher safe, and ideal for home bars, lounge parties, and everyday chilled brews.",
        shortDescription: "450ml heavy glass beer mug with crystal clear cut finish & sturdy handle.",
        categoryId: drinkwareCategory.id,
        price: 149.00,
        compareAtPrice: 299.00,
        stock: 300,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Heavy Glass Classic Beer Mug (450ml)",
        slug: slug3,
        sku: "KK-MUG-BEER-450",
        description: "Elevate your draught beer experience with our Heavy Glass Classic Beer Mug (450ml). Built with thick, durable soda-lime glass, an ergonomic sturdy handle, and a crystal clear oval cut pattern for superior clarity. Engineered for long-lasting durability, dishwasher safe, and ideal for home bars, lounge parties, and everyday chilled brews.",
        shortDescription: "450ml heavy glass beer mug with crystal clear cut finish & sturdy handle.",
        categoryId: drinkwareCategory.id,
        price: 149.00,
        compareAtPrice: 299.00,
        stock: 300,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p3.id } });
    await db.productMedia.createMany({
      data: product3Media.map((m) => ({ ...m, productId: p3.id }))
    });

    // ── Product 4: Premium Twisted Wave Glass Water Bottle (₹199, MRP ₹299) ──
    const product4Media = await uploadImageSet(slug4, [
      { name: "banner", b64Data: TWISTED_BOTTLE_IMAGES_DATA.banner, fallbackUrl: "/products/twisted-bottle-banner.jpg" },
      { name: "studio", b64Data: TWISTED_BOTTLE_IMAGES_DATA.studio, fallbackUrl: "/products/twisted-bottle-studio.jpg" },
      { name: "macro", b64Data: TWISTED_BOTTLE_IMAGES_DATA.macro, fallbackUrl: "/products/twisted-bottle-macro.jpg" },
      { name: "desk", b64Data: TWISTED_BOTTLE_IMAGES_DATA.desk, fallbackUrl: "/products/twisted-bottle-desk.jpg" }
    ]);

    const p4 = await db.product.upsert({
      where: { slug: slug4 },
      update: {
        name: "Premium Twisted Wave Glass Water Bottle",
        sku: "KK-BTL-TWIST-199",
        description: "Crafted for a pure and healthy lifestyle. Our Premium Twisted Wave Glass Water Bottle features an elegant vertical twisted spiral pattern for a comfortable grip and a timeless look. Engineered with strong, durable borosilicate glass, 100% BPA-free non-toxic material, a wide mouth for easy cleaning, and a leak-proof stainless steel cap with food-grade seal. Keeps your water pure, fresh, and chemical-free.",
        shortDescription: "Premium borosilicate glass water bottle with elegant twisted wave grip & leak-proof cap.",
        categoryId: bottleCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 450,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Premium Twisted Wave Glass Water Bottle",
        slug: slug4,
        sku: "KK-BTL-TWIST-199",
        description: "Crafted for a pure and healthy lifestyle. Our Premium Twisted Wave Glass Water Bottle features an elegant vertical twisted spiral pattern for a comfortable grip and a timeless look. Engineered with strong, durable borosilicate glass, 100% BPA-free non-toxic material, a wide mouth for easy cleaning, and a leak-proof stainless steel cap with food-grade seal. Keeps your water pure, fresh, and chemical-free.",
        shortDescription: "Premium borosilicate glass water bottle with elegant twisted wave grip & leak-proof cap.",
        categoryId: bottleCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 450,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p4.id } });
    await db.productMedia.createMany({
      data: product4Media.map((m) => ({ ...m, productId: p4.id }))
    });

    // ── Product 5: Glass Mason Jar Mug with Black Lid (450ml, ₹149, MRP ₹299) ──
    const product5Media = await uploadImageSet(slug5, [
      { name: "banner", b64Data: MASON_JAR_IMAGES_DATA.banner, fallbackUrl: "/products/mason-jar-banner.jpg" },
      { name: "studio", b64Data: MASON_JAR_IMAGES_DATA.studio, fallbackUrl: "/products/mason-jar-studio.jpg" },
      { name: "drink", b64Data: MASON_JAR_IMAGES_DATA.drink, fallbackUrl: "/products/mason-jar-iced-coffee.jpg" },
      { name: "macro", b64Data: MASON_JAR_IMAGES_DATA.macro, fallbackUrl: "/products/mason-jar-lemonade.jpg" }
    ]);

    const p5 = await db.product.upsert({
      where: { slug: slug5 },
      update: {
        name: "Glass Mason Jar Mug with Black Lid (450ml)",
        sku: "KK-JAR-MASON-149",
        description: "Serve your favourite cold brew, iced coffee, smoothies, infused waters, and mocktails in our Glass Mason Jar Mug (450ml). Featuring crystal-clear heavy glass, an ergonomic side handle, and an airtight black metal screw-on lid to keep beverages fresh and spill-free. Perfect for home cafes, kitchen storage, and casual outdoor entertaining.",
        shortDescription: "450ml glass mason jar mug with sturdy handle & airtight black metal lid.",
        categoryId: drinkwareCategory.id,
        price: 149.00,
        compareAtPrice: 299.00,
        stock: 400,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Glass Mason Jar Mug with Black Lid (450ml)",
        slug: slug5,
        sku: "KK-JAR-MASON-149",
        description: "Serve your favourite cold brew, iced coffee, smoothies, infused waters, and mocktails in our Glass Mason Jar Mug (450ml). Featuring crystal-clear heavy glass, an ergonomic side handle, and an airtight black metal screw-on lid to keep beverages fresh and spill-free. Perfect for home cafes, kitchen storage, and casual outdoor entertaining.",
        shortDescription: "450ml glass mason jar mug with sturdy handle & airtight black metal lid.",
        categoryId: drinkwareCategory.id,
        price: 149.00,
        compareAtPrice: 299.00,
        stock: 400,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p5.id } });
    await db.productMedia.createMany({
      data: product5Media.map((m) => ({ ...m, productId: p5.id }))
    });

    // ── Product 6: Floral Embossed Glass Matki Jars (350ml - Pack of 2) (₹189, MRP ₹299) ──
    const product6Media = await uploadImageSet(slug6, [
      { name: "cover", b64Data: MATKI_JAR_IMAGES_DATA.cover, fallbackUrl: "/products/matki-jars-pack2-cover.jpg" },
      { name: "filled", b64Data: MATKI_JAR_IMAGES_DATA.filled, fallbackUrl: "/products/matki-jars-dryfruits-candy.jpg" },
      { name: "macro", b64Data: MATKI_JAR_IMAGES_DATA.macro, fallbackUrl: "/products/matki-jars-macro-gold.jpg" },
      { name: "pantry", b64Data: MATKI_JAR_IMAGES_DATA.pantry, fallbackUrl: "/products/matki-jars-pantry-shelf.jpg" }
    ]);

    const p6 = await db.product.upsert({
      where: { slug: slug6 },
      update: {
        name: "Floral Embossed Glass Matki Jars (350ml - Pack of 2)",
        sku: "KK-JAR-MATKI-350-P2",
        description: "Organize and display your kitchen treats in elegance with our Floral Embossed Glass Matki Jars (350ml - Pack of 2). Crafted with a traditional pot-shaped matki silhouette and intricate floral glass embossing, each jar features a premium airtight golden metal screw lid. Perfect for serving and storing dry fruits, almonds, cashews, festive candies, mouth fresheners, ghee, jams, honey, and spices. Made from 100% lead-free food-safe glass.",
        shortDescription: "Pack of 2 floral embossed 350ml glass matki jars with airtight golden lids.",
        categoryId: storageCategory.id,
        price: 189.00,
        compareAtPrice: 299.00,
        stock: 250,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Floral Embossed Glass Matki Jars (350ml - Pack of 2)",
        slug: slug6,
        sku: "KK-JAR-MATKI-350-P2",
        description: "Organize and display your kitchen treats in elegance with our Floral Embossed Glass Matki Jars (350ml - Pack of 2). Crafted with a traditional pot-shaped matki silhouette and intricate floral glass embossing, each jar features a premium airtight golden metal screw lid. Perfect for serving and storing dry fruits, almonds, cashews, festive candies, mouth fresheners, ghee, jams, honey, and spices. Made from 100% lead-free food-safe glass.",
        shortDescription: "Pack of 2 floral embossed 350ml glass matki jars with airtight golden lids.",
        categoryId: storageCategory.id,
        price: 189.00,
        compareAtPrice: 299.00,
        stock: 250,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p6.id } });
    await db.productMedia.createMany({
      data: product6Media.map((m) => ({ ...m, productId: p6.id }))
    });

    // ── Product 7: Premium Ribbed Glass Storage Jars (300ml - Pack of 2) (₹189, MRP ₹299) ──
    const product7Media = await uploadImageSet(slug7, [
      { name: "banner", b64Data: RIBBED_JAR_IMAGES_DATA.banner, fallbackUrl: "/products/ribbed-jars-pack2-banner.jpg" },
      { name: "studio", b64Data: RIBBED_JAR_IMAGES_DATA.studio, fallbackUrl: "/products/ribbed-jars-pack2-studio.jpg" },
      { name: "macro", b64Data: RIBBED_JAR_IMAGES_DATA.macro, fallbackUrl: "/products/ribbed-jars-pack2-macro.jpg" },
      { name: "pantry", b64Data: RIBBED_JAR_IMAGES_DATA.pantry, fallbackUrl: "/products/ribbed-jars-pack2-pantry.jpg" }
    ]);

    const p7 = await db.product.upsert({
      where: { slug: slug7 },
      update: {
        name: "Premium Ribbed Glass Storage Jars (300ml - Pack of 2)",
        sku: "KK-JAR-RIBBED-300-P2",
        description: "Choose better, live lighter, and make a difference. Our Premium Ribbed Glass Storage Jars (300ml - Pack of 2) feature an elegant vertical fluting rib texture that adds a touch of modern minimalism to any kitchen. Equipped with airtight golden metal screw lids, these 300ml jars are perfect for serving and preserving almonds, cashews, spices, tea leaves, coffee beans, cookies, and pulses. Crafted from high-clarity durable lead-free glass.",
        shortDescription: "Pack of 2 modern ribbed 300ml glass storage jars with airtight gold lids.",
        categoryId: storageCategory.id,
        price: 189.00,
        compareAtPrice: 299.00,
        stock: 300,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Premium Ribbed Glass Storage Jars (300ml - Pack of 2)",
        slug: slug7,
        sku: "KK-JAR-RIBBED-300-P2",
        description: "Choose better, live lighter, and make a difference. Our Premium Ribbed Glass Storage Jars (300ml - Pack of 2) feature an elegant vertical fluting rib texture that adds a touch of modern minimalism to any kitchen. Equipped with airtight golden metal screw lids, these 300ml jars are perfect for serving and preserving almonds, cashews, spices, tea leaves, coffee beans, cookies, and pulses. Crafted from high-clarity durable lead-free glass.",
        shortDescription: "Pack of 2 modern ribbed 300ml glass storage jars with airtight gold lids.",
        categoryId: storageCategory.id,
        price: 189.00,
        compareAtPrice: 299.00,
        stock: 300,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p7.id } });
    await db.productMedia.createMany({
      data: product7Media.map((m) => ({ ...m, productId: p7.id }))
    });

    // ── Product 8: 1-Liter Square Check Glass Water Bottle (₹199, MRP ₹299) ──
    const product8Media = await uploadImageSet(slug8, [
      { name: "banner", b64Data: SQUARE_CHECK_1L_IMAGES_DATA.banner, fallbackUrl: "/products/square-check-1l-banner.jpg" },
      { name: "studio", b64Data: SQUARE_CHECK_1L_IMAGES_DATA.studio, fallbackUrl: "/products/square-check-1l-studio.jpg" },
      { name: "macro", b64Data: SQUARE_CHECK_1L_IMAGES_DATA.macro, fallbackUrl: "/products/square-check-1l-macro.jpg" },
      { name: "desk", b64Data: SQUARE_CHECK_1L_IMAGES_DATA.desk, fallbackUrl: "/products/square-check-1l-desk.jpg" }
    ]);

    const p8 = await db.product.upsert({
      where: { slug: slug8 },
      update: {
        name: "1-Liter Square Check Glass Water Bottle",
        sku: "KK-BTL-SQ-1000",
        description: "Stay hydrated in style with our 1-Liter Square Check Glass Water Bottle. Crafted from premium high-clarity borosilicate glass, this bottle stands 28cm tall and features an anti-slip square check grid pattern. Equipped with an airtight leak-proof stainless steel screw cap to keep water, juices, and beverages fresh and secure. Designed for modern dining tables, home refrigerators, and office desks.",
        shortDescription: "1-Liter premium leak-proof glass water bottle with square check grid pattern.",
        categoryId: bottleCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 300,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "1-Liter Square Check Glass Water Bottle",
        slug: slug8,
        sku: "KK-BTL-SQ-1000",
        description: "Stay hydrated in style with our 1-Liter Square Check Glass Water Bottle. Crafted from premium high-clarity borosilicate glass, this bottle stands 28cm tall and features an anti-slip square check grid pattern. Equipped with an airtight leak-proof stainless steel screw cap to keep water, juices, and beverages fresh and secure. Designed for modern dining tables, home refrigerators, and office desks.",
        shortDescription: "1-Liter premium leak-proof glass water bottle with square check grid pattern.",
        categoryId: bottleCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 300,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p8.id } });
    await db.productMedia.createMany({
      data: product8Media.map((m) => ({ ...m, productId: p8.id }))
    });

    // ── Product 9: Premium Round Spiral Ribbed Glass Bottle (750ml) (₹199, MRP ₹299) ──
    const product9Media = await uploadImageSet(slug9, [
      { name: "banner", b64Data: ROUND_RIBBED_750_IMAGES_DATA.banner, fallbackUrl: "/products/round-ribbed-750-banner.jpg" },
      { name: "studio", b64Data: ROUND_RIBBED_750_IMAGES_DATA.studio, fallbackUrl: "/products/round-ribbed-750-studio.jpg" },
      { name: "macro", b64Data: ROUND_RIBBED_750_IMAGES_DATA.macro, fallbackUrl: "/products/round-ribbed-750-macro.jpg" },
      { name: "desk", b64Data: ROUND_RIBBED_750_IMAGES_DATA.desk, fallbackUrl: "/products/round-ribbed-750-desk.jpg" }
    ]);

    const p9 = await db.product.upsert({
      where: { slug: slug9 },
      update: {
        name: "Premium Round Spiral Ribbed Glass Bottle (750ml)",
        sku: "KK-BTL-ROUND-RIBBED-750",
        description: "Hydrate elegantly with our Premium Round Spiral Ribbed Glass Bottle (750ml). Featuring a beautiful vertical spiral wave rib texture for a comfortable non-slip grip, this 750ml bottle is crafted from lead-free, eco-friendly food-grade glass. Finished with an airtight leak-proof stainless steel cap, it's perfect for keeping your water fresh on dining tables, in fridges, or in the office.",
        shortDescription: "750ml clear glass bottle with elegant round spiral ribbed pattern and stainless steel cap.",
        categoryId: bottleCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 350,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Premium Round Spiral Ribbed Glass Bottle (750ml)",
        slug: slug9,
        sku: "KK-BTL-ROUND-RIBBED-750",
        description: "Hydrate elegantly with our Premium Round Spiral Ribbed Glass Bottle (750ml). Featuring a beautiful vertical spiral wave rib texture for a comfortable non-slip grip, this 750ml bottle is crafted from lead-free, eco-friendly food-grade glass. Finished with an airtight leak-proof stainless steel cap, it's perfect for keeping your water fresh on dining tables, in fridges, or in the office.",
        shortDescription: "750ml clear glass bottle with elegant round spiral ribbed pattern and stainless steel cap.",
        categoryId: bottleCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 350,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p9.id } });
    await db.productMedia.createMany({
      data: product9Media.map((m) => ({ ...m, productId: p9.id }))
    });

    // ── Product 10: Round Glass Storage Jars (550ml - Pack of 2) (₹199, MRP ₹299) ──
    const product10Media = await uploadImageSet(slug10, [
      { name: "banner", b64Data: JARS_550ML_IMAGES_DATA.banner, fallbackUrl: "/products/jars-550ml-pack2-banner.jpg" },
      { name: "studio", b64Data: JARS_550ML_IMAGES_DATA.studio, fallbackUrl: "/products/jars-550ml-pack2-studio.jpg" },
      { name: "macro", b64Data: JARS_550ML_IMAGES_DATA.macro, fallbackUrl: "/products/jars-550ml-pack2-macro.jpg" },
      { name: "desk", b64Data: JARS_550ML_IMAGES_DATA.desk, fallbackUrl: "/products/jars-550ml-pack2-desk.jpg" }
    ]);

    const p10 = await db.product.upsert({
      where: { slug: slug10 },
      update: {
        name: "Round Glass Storage Jars (550ml - Pack of 2)",
        sku: "KK-JAR-ROUND-550-P2",
        description: "Keep your kitchen pantry neat, fresh, and beautiful with our Round Glass Storage Jars (550ml - Pack of 2). These 550ml jars feature clean round high-clarity glass structures with premium airtight golden metal screw lids. Perfect for serving and storing large portions of dry fruits, almonds, cashews, spices, flour, pickles, and candy. Safe, durable, and lead-free.",
        shortDescription: "Pack of 2 classic round 550ml glass storage jars with airtight golden screw lids.",
        categoryId: storageCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 250,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      },
      create: {
        name: "Round Glass Storage Jars (550ml - Pack of 2)",
        slug: slug10,
        sku: "KK-JAR-ROUND-550-P2",
        description: "Keep your kitchen pantry neat, fresh, and beautiful with our Round Glass Storage Jars (550ml - Pack of 2). These 550ml jars feature clean round high-clarity glass structures with premium airtight golden metal screw lids. Perfect for serving and storing large portions of dry fruits, almonds, cashews, spices, flour, pickles, and candy. Safe, durable, and lead-free.",
        shortDescription: "Pack of 2 classic round 550ml glass storage jars with airtight golden screw lids.",
        categoryId: storageCategory.id,
        price: 199.00,
        compareAtPrice: 299.00,
        stock: 250,
        isActive: true,
        isFeatured: true,
        isBestSeller: true,
        isNewArrival: true
      }
    });

    await db.productMedia.deleteMany({ where: { productId: p10.id } });
    await db.productMedia.createMany({
      data: product10Media.map((m) => ({ ...m, productId: p10.id }))
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
