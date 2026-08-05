"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Camera, ShieldCheck, CheckCircle2, MessageSquarePlus, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { WriteReviewModal } from "@/components/reviews/write-review-modal";
import { formatDateTime } from "@/lib/money";

type ReviewUser = {
  name: string | null;
  image: string | null;
};

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  user: ReviewUser;
};

type Stats = {
  totalCount: number;
  averageRating: number;
  distribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  customerImagesCount: number;
};

type CustomerImage = {
  url: string;
  reviewId: string;
  userName: string;
  rating: number;
};

type Props = {
  productId: string;
  productName: string;
  productImage?: string;
};

export function ProductReviewsSection({ productId, productName, productImage }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCount: 0,
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    customerImagesCount: 0
  });
  const [customerImages, setCustomerImages] = useState<CustomerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "photos" | "5star" | "4star">("all");
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products/${productId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setStats(
          data.stats || {
            totalCount: 0,
            averageRating: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            customerImagesCount: 0
          }
        );
        setCustomerImages(data.customerImages || []);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = reviews.filter((r) => {
    if (filter === "photos") return r.images && r.images.length > 0;
    if (filter === "5star") return r.rating === 5;
    if (filter === "4star") return r.rating === 4;
    return true;
  });

  const handleWriteClick = () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsWriteModalOpen(true);
  };

  return (
    <section id="reviews-section" className="scroll-mt-24 border-t border-gold/15 py-16">
      <div className="container space-y-12">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Verified Customer Feedback</span>
            <h2 className="mt-1 font-serif text-3xl sm:text-4xl font-bold text-slate-900">
              Customer Ratings & Reviews
            </h2>
          </div>
          <Button
            onClick={handleWriteClick}
            variant="gold"
            className="font-bold gap-2 self-start sm:self-auto shadow-md"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </Button>
        </div>

        {/* Rating Breakdown & Summary Grid */}
        <div className="grid gap-8 lg:grid-cols-12 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          {/* Overall Score Box */}
          <div className="lg:col-span-4 flex flex-col justify-center items-center text-center p-6 rounded-2xl bg-gradient-to-b from-amber-50/50 to-amber-100/30 border border-amber-200/60">
            <span className="font-serif text-6xl font-extrabold text-slate-900 tracking-tight">
              {stats.averageRating > 0 ? stats.averageRating : "5.0"}
            </span>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.averageRating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 fill-slate-100"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm font-bold text-slate-800">
              Based on {stats.totalCount} verified review{stats.totalCount !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>100% Authentic Customer Purchases</span>
            </p>
          </div>

          {/* Star Distribution Progress Bars */}
          <div className="lg:col-span-8 flex flex-col justify-center space-y-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Rating Breakdown</p>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.distribution[stars as 1 | 2 | 3 | 4 | 5] || 0;
              const percent = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : stars === 5 ? 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-1 w-14 shrink-0">
                    <span>{stars}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 inline" />
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-slate-500 font-mono text-[11px]">{count} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Uploaded Photo Gallery Strip */}
        {customerImages.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif text-xl font-bold text-slate-900">Customer Photos</h3>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  {customerImages.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Click photo to view full size</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-amber-200">
              {customerImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxImage(img.url)}
                  className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shrink-0 border-2 border-slate-200 hover:border-amber-500 transition-all duration-300 group shadow-sm"
                >
                  <img src={img.url} alt={`Customer photo by ${img.userName}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-2 left-2 right-2 bg-slate-950/75 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="truncate">{img.userName}</span>
                    <span className="flex items-center text-amber-300">★ {img.rating}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          {customerImages.length > 0 ? (
            <button
              onClick={() => setFilter("photos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === "photos"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              <span>With Photos ({reviews.filter((r) => r.images?.length > 0).length})</span>
            </button>
          ) : null}
          <button
            onClick={() => setFilter("5star")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "5star"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            5 Stars ({stats.distribution[5] || 0})
          </button>
          <button
            onClick={() => setFilter("4star")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === "4star"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            4 Stars ({stats.distribution[4] || 0})
          </button>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm font-semibold">
            Loading reviews...
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="grid gap-6">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 sm:p-7 rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-shadow space-y-4"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm">
                      {(rev.user?.name || "Customer").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rev.user?.name || "KanchKart Customer"}</span>
                        {rev.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified Buyer
                          </span>
                        ) : null}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                        Reviewed on {formatDateTime(new Date(rev.createdAt))}
                      </p>
                    </div>
                  </div>

                  {/* Star Rating Badge */}
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-amber-900">{rev.rating}.0</span>
                  </div>
                </div>

                {/* Review Title & Body */}
                <div className="space-y-1.5">
                  {rev.title ? (
                    <h4 className="font-bold text-slate-900 text-base">{rev.title}</h4>
                  ) : null}
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {rev.body}
                  </p>
                </div>

                {/* Uploaded Customer Photos Grid */}
                {rev.images && rev.images.length > 0 ? (
                  <div className="flex flex-wrap gap-3 pt-2">
                    {rev.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setLightboxImage(img)}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-slate-200 hover:border-amber-500 transition group"
                      >
                        <img src={img} alt={`Customer upload ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-3">
            <MessageSquarePlus className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-serif text-xl font-bold text-slate-900">No Reviews Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first verified customer to share your thoughts and photos of this glassware!
            </p>
            <Button onClick={handleWriteClick} variant="gold" size="sm" className="font-bold mt-2">
              Write the First Review
            </Button>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        productId={productId}
        productName={productName}
        productImage={productImage}
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSuccess={fetchReviews}
      />

      {/* Lightbox Modal for Customer Photos */}
      {lightboxImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={lightboxImage} alt="Customer photo enlarged" className="max-w-full max-h-[85vh] object-contain mx-auto" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
