import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { configureCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please log in to submit a review." }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderId, rating, title, body: reviewBody, images } = body;

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
    }

    if (!reviewBody || typeof reviewBody !== "string" || reviewBody.trim().length < 5) {
      return NextResponse.json({ error: "Please write a feedback comment (at least 5 characters)." }, { status: 400 });
    }

    // Verify user purchased the product
    const orderWithItem = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        items: {
          some: { productId }
        }
      },
      select: { id: true }
    });

    const isVerified = Boolean(orderWithItem);

    // Process uploaded images (if any)
    const processedImages: string[] = [];
    if (Array.isArray(images) && images.length > 0) {
      for (const img of images.slice(0, 5)) {
        if (typeof img !== "string" || !img) continue;

        // If it's already an http/https URL, keep it
        if (img.startsWith("http://") || img.startsWith("https://")) {
          processedImages.push(img);
          continue;
        }

        // If base64 data URL and Cloudinary is configured, upload to Cloudinary
        if (img.startsWith("data:image/") && env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret) {
          try {
            const cloudinary = configureCloudinary();
            const res = await cloudinary.uploader.upload(img, {
              folder: `${env.cloudinaryUploadFolder}/reviews`.replace(/\/+/g, "/")
            });
            if (res?.secure_url) {
              processedImages.push(res.secure_url);
              continue;
            }
          } catch (err) {
            console.error("Cloudinary review image upload error:", err);
          }
        }

        // Fallback to data URL if small enough
        if (img.startsWith("data:image/") && img.length < 500000) {
          processedImages.push(img);
        }
      }
    }

    // Upsert review for this user and product
    const review = await db.review.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      },
      create: {
        userId: session.user.id,
        productId,
        orderId: orderId || orderWithItem?.id,
        rating: Math.round(rating),
        title: title ? String(title).trim().slice(0, 120) : null,
        body: String(reviewBody).trim(),
        images: processedImages,
        isVerified,
        isApproved: true
      },
      update: {
        rating: Math.round(rating),
        title: title ? String(title).trim().slice(0, 120) : null,
        body: String(reviewBody).trim(),
        images: processedImages,
        isVerified,
        isApproved: true,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Your review has been submitted and published successfully!",
      review
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json({ error: "Failed to submit review. Please try again." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all completed/active orders for the user
    const userOrders = await db.order.findMany({
      where: {
        userId: session.user.id,
        status: { notIn: ["CANCELLED", "REFUNDED"] }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                media: { take: 1, orderBy: { position: "asc" } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Get user's existing reviews
    const userReviews = await db.review.findMany({
      where: { userId: session.user.id }
    });

    const reviewsMap = new Map(userReviews.map((r) => [r.productId, r]));

    // Extract unique purchased products with review status
    const purchasedProductsMap = new Map();
    for (const order of userOrders) {
      for (const item of order.items) {
        if (!purchasedProductsMap.has(item.productId)) {
          const review = reviewsMap.get(item.productId);
          purchasedProductsMap.set(item.productId, {
            productId: item.productId,
            productName: item.name,
            productSlug: item.product.slug,
            productImage: item.product.media[0]?.url || "/brand/drinkware.svg",
            orderId: order.id,
            orderNumber: order.orderNumber,
            purchasedAt: order.createdAt,
            hasReviewed: Boolean(review),
            review: review || null
          });
        }
      }
    }

    return NextResponse.json({
      items: Array.from(purchasedProductsMap.values())
    });
  } catch (error) {
    console.error("Error fetching user reviewable products:", error);
    return NextResponse.json({ error: "Failed to fetch reviewable products." }, { status: 500 });
  }
}
