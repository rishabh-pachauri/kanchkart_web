"use client";

import { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WriteReviewModal } from "@/components/reviews/write-review-modal";

type OrderItemProduct = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

type ItemProps = {
  orderId: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string | null;
  hasReviewed?: boolean;
};

export function RateProductButton({
  orderId,
  productId,
  productName,
  productImage,
  hasReviewed
}: ItemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewed, setReviewed] = useState(hasReviewed);

  return (
    <>
      <Button
        type="button"
        variant={reviewed ? "outline" : "gold"}
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="font-bold text-xs gap-1.5 rounded-xl transition-all"
      >
        {reviewed ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Reviewed ★</span>
          </>
        ) : (
          <>
            <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
            <span>Rate & Review</span>
          </>
        )}
      </Button>

      <WriteReviewModal
        productId={productId}
        productName={productName}
        productImage={productImage || undefined}
        orderId={orderId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setReviewed(true)}
      />
    </>
  );
}
