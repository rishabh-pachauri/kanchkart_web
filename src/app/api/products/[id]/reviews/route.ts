import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    const reviews = await db.review.findMany({
      where: {
        productId,
        isApproved: true
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const totalCount = reviews.length;
    let averageRating = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const allImages: { url: string; reviewId: string; userName: string; rating: number }[] = [];

    if (totalCount > 0) {
      const sum = reviews.reduce((acc, r) => {
        const rating = Math.min(5, Math.max(1, r.rating));
        distribution[rating as 1 | 2 | 3 | 4 | 5] = (distribution[rating as 1 | 2 | 3 | 4 | 5] || 0) + 1;
        
        // Collect customer images
        if (r.images && Array.isArray(r.images)) {
          r.images.forEach((url) => {
            allImages.push({
              url,
              reviewId: r.id,
              userName: r.user.name || "KanchKart Customer",
              rating: r.rating
            });
          });
        }

        return acc + r.rating;
      }, 0);

      averageRating = Number((sum / totalCount).toFixed(1));
    }

    return NextResponse.json({
      reviews,
      stats: {
        totalCount,
        averageRating,
        distribution,
        customerImagesCount: allImages.length
      },
      customerImages: allImages
    });
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    return NextResponse.json({ error: "Failed to load product reviews." }, { status: 500 });
  }
}
