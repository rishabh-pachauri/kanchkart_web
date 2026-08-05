import Link from "next/link";
import Image from "next/image";
import { Package, Truck, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/money";
import { siteMetadata } from "@/lib/seo";
import { requireUser } from "@/lib/security";
import { Button } from "@/components/ui/button";
import { RateProductButton } from "@/components/account/customer-order-reviews-manager";

export const metadata = siteMetadata({ title: "My Order History | KanchKart" });

export default async function AccountOrdersPage() {
  const user = await requireUser();

  const [orders, userReviews] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
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
    }),
    db.review.findMany({
      where: { userId: user.id },
      select: { productId: true }
    })
  ]);

  const reviewedProductIds = new Set(userReviews.map((r) => r.productId));

  return (
    <section className="container py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link href="/account" className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Account Dashboard
          </Link>
          <h1 className="font-serif text-4xl font-bold text-slate-900">My Orders & Reviews</h1>
          <p className="text-xs text-slate-500 mt-1">Track purchases and share feedback on your glassware items</p>
        </div>
        <Button asChild variant="gold" size="sm" className="font-bold self-start sm:self-auto">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>

      {orders.length > 0 ? (
        <div className="grid gap-6">
          {orders.map((order) => (
            <div key={order.id} className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition space-y-5">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-base">#{order.orderNumber}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Placed on {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-lg">{formatPrice(order.grandTotal)}</span>
                  <Button asChild variant="outline" size="sm" className="font-bold text-xs rounded-xl gap-1">
                    <Link href={`/track-order?orderNumber=${order.orderNumber}`}>
                      <Truck className="w-3.5 h-3.5" /> Track
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Order Items List */}
              <div className="divide-y divide-slate-100">
                {order.items.map((item) => {
                  const image = item.product?.media[0]?.url || "/brand/drinkware.svg";
                  const slug = item.product?.slug || "#";
                  const hasReviewed = reviewedProductIds.has(item.productId);

                  return (
                    <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <Link href={`/product/${slug}`} className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 group">
                          <Image src={image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                        <div>
                          <Link href={`/product/${slug}`} className="font-bold text-slate-900 text-sm hover:text-amber-700 transition line-clamp-1">
                            {item.name}
                          </Link>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Rate & Review Button */}
                      <div className="self-end sm:self-auto shrink-0">
                        <RateProductButton
                          orderId={order.id}
                          productId={item.productId}
                          productName={item.name}
                          productSlug={slug}
                          productImage={image}
                          hasReviewed={hasReviewed}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-3">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h2 className="font-serif text-xl font-bold text-slate-900">No Orders Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven&apos;t placed any orders yet. Explore our handcrafted glassware collections!
          </p>
          <Button asChild variant="gold" size="sm" className="font-bold mt-2">
            <Link href="/shop">Explore Shop</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
