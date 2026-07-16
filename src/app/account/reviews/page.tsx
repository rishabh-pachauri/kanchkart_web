import { db } from "@/lib/db";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";

export const metadata = siteMetadata({ title: "Reviews" });

export default async function AccountReviewsPage() {
  const user = await requireUser();
  const reviews = await db.review.findMany({
    where: { userId: user.id },
    include: { product: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Reviews</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Your product reviews</h1>
      <div className="mt-8 grid gap-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-md border bg-white/70 p-4">
            <p className="font-medium">{review.product.name}</p>
            <p className="text-sm text-muted-foreground">
              {review.rating}/5 · {review.isApproved ? "Published" : "Pending approval"}
            </p>
            <p className="mt-2 text-sm leading-6">{review.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

