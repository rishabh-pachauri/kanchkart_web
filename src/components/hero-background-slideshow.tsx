"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Background Image Slideshow with Smooth Crossfade */}
      {backgroundImages.map((img, idx) => (
        <div
          key={img.url}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-85 scale-100" : "opacity-0 scale-105 pointer-events-none"
          }`}
        >
          <Image
            src={img.url}
            alt={img.alt}
            fill
            priority={idx === 0}
            sizes="100vw"
            className="object-cover transition-transform duration-[6000ms] ease-out"
          />
        </div>
      ))}

      {/* Subtle Gradient Overlay for Text Readability without Obscuring the Imagery */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent backdrop-blur-[0.5px]" />

      {/* Slideshow Navigation Indicator Dots */}
      <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2">
        {backgroundImages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? "w-8 bg-gold" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
