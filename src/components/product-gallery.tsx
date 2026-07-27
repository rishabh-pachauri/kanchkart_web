"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductMedia } from "@prisma/client";

export function ProductGallery({
  media,
  name
}: {
  media: ProductMedia[];
  name: string;
}) {
  const images = media.length > 0 ? media.map((m) => m.url) : ["/brand/drinkware.svg"];
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className="grid gap-4 md:grid-cols-[96px_1fr]">
      {/* Thumbnail Bar */}
      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-y-auto max-h-[500px]">
          {images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImage(url)}
              className={`relative aspect-square shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                selectedImage === url
                  ? "border-gold shadow-md scale-95"
                  : "border-transparent opacity-70 hover:opacity-100"
              } bg-white h-20 w-20 md:h-24 md:w-24`}
            >
              <Image src={url} alt={`${name} image ${idx + 1}`} fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}

      {/* Main Image Display */}
      <div className="glass-highlight relative aspect-square overflow-hidden rounded-2xl border border-gold/20 bg-secondary/40 shadow-soft">
        <Image
          src={selectedImage}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>
    </div>
  );
}
