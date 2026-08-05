"use client";

import { useState } from "react";
import { Star, Upload, X, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type Props = {
  productId: string;
  productName: string;
  productImage?: string;
  orderId?: string;
  existingReview?: {
    rating: number;
    title?: string | null;
    body: string;
    images?: string[];
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function WriteReviewModal({
  productId,
  productName,
  productImage,
  orderId,
  existingReview,
  isOpen,
  onClose,
  onSuccess
}: Props) {
  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>(existingReview?.title || "");
  const [body, setBody] = useState<string>(existingReview?.body || "");
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      setError("Maximum 5 images allowed per review.");
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 8 * 1024 * 1024) {
        setError("Each image must be smaller than 8MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === "string") {
          setImages((prev) => [...prev, event.target!.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || body.trim().length < 5) {
      setError("Please write a feedback comment of at least 5 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          orderId,
          rating,
          title: title.trim(),
          body: body.trim(),
          images
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setSuccess(true);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-slate-900">Review Published!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Thank you for your valuable feedback. Your rating and photos are now live on the product page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Buyer Review</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-900">
                {existingReview ? "Update Your Review" : "Write a Product Review"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Share your authentic experience to help other buyers make informed choices.
              </p>
            </div>

            {/* Product Card Snippet */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              {productImage ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200">
                  <Image src={productImage} alt={productName} fill className="object-cover" />
                </div>
              ) : null}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reviewing Item</p>
                <p className="text-sm font-bold text-slate-900 truncate">{productName}</p>
              </div>
            </div>

            {/* Star Rating Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Overall Rating <span className="text-amber-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          active
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                            : "text-slate-300 fill-slate-100"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-3 text-sm font-bold text-slate-700">
                  {hoverRating || rating} / 5 Stars
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Review Headline <span className="text-slate-400 font-normal text-[11px]">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Premium quality glass, looks amazing on my table!"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition"
              />
            </div>

            {/* Review Body */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Detailed Feedback <span className="text-amber-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                required
                placeholder="Write your honest review about the glass clarity, build quality, packaging, and delivery experience..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition leading-relaxed resize-none"
              />
            </div>

            {/* Customer Photo Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Photos <span className="text-slate-400 font-normal text-[11px]">(Optional, Max 5)</span>
                </label>
                <span className="text-xs font-semibold text-slate-500">{images.length}/5 uploaded</span>
              </div>

              {/* Photo Previews Grid */}
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-400/50 group shadow-sm">
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-slate-950/80 text-white opacity-90 group-hover:opacity-100 hover:bg-red-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="flex flex-col items-center justify-center w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/40 text-slate-500 hover:text-amber-600 cursor-pointer transition group">
                    <Upload className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-bold mt-1">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {error ? (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl">
                {error}
              </p>
            ) : null}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="gold" disabled={isSubmitting} className="font-bold gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <span>Publish Review</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
