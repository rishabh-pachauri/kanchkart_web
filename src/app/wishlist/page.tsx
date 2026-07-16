import { ProductCard } from "@/components/product-card";
import { db } from "@/lib/db";
import { productInclude } from "@/lib/commerce";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";

export const metadata = siteMetadata({ title: "Wishlist" });

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await db.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="container py-10">
      <p className="text-sm font-semibold uppercase text-gold">Wishlist</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">Saved pieces</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
    </section>
  );
}

