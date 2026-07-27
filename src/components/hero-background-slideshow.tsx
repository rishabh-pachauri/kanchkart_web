"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

const backgroundImages = [
  {
    url: "/brand/nature-glass-bg.jpg",
    alt: "Pure Glass Water Bottle in Nature Forest (Glass Over Plastic)"
  },
  {
    url: "/brand/nature-glass-bg-2.jpg",
    alt: "Borosilicate Glass Hydration Bottle in Sunlit Bamboo Forest"
  },
  {
    url: "/brand/nature-glass-bg-3.jpg",
    alt: "Luxury Glass Carafe & Tumblers by Mountain Stream"
  },
  {
    url: "/brand/nature-glass-bg-4.jpg",
    alt: "Airtight Glass Pantry Jars in Botanical Sunlit Garden"
  }
];

export function HeroBackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5500); // 5.5 seconds per slide for ultra-smooth pacing

    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-charcoal">
      {/* Background Images with Butter-Smooth Crossfade & Ken Burns Zoom */}
      {backgroundImages.map((img, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={img.url}
            className={`absolute inset-0 transition-opacity duration-[1800ms] ease-in-out ${
              isActive ? "opacity-85 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              priority={idx === 0}
              sizes="100vw"
              className={`object-cover transition-transform duration-[7000ms] ease-out ${
                isActive ? "scale-100" : "scale-105"
              }`}
            />
          </div>
        );
      })}

      {/* Gentle Gradient Overlay for Crisp Text Readability */}
      <div className="absolute inset-0 z-15 bg-gradient-to-r from-charcoal/90 via-charcoal/65 to-transparent backdrop-blur-[0.5px]" />

      {/* Ultra-Smooth Slideshow Navigation Indicator Pills */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-2.5 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 shadow-lg">
        {backgroundImages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-700 ease-in-out ${
              idx === currentIndex
                ? "w-8 bg-gold shadow-gold-glow"
                : "w-2.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
