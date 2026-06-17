"use client";

import { useState } from "react";
import Image from "next/image";

function GalleryImage({
  src,
  alt,
  isThumbnail = false,
  priority = false,
}: {
  src: string;
  alt: string;
  isThumbnail?: boolean;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={`relative bg-[#1a1208] flex items-center justify-center overflow-hidden rounded-2xl ${
          isThumbnail ? "w-full h-full" : "w-full aspect-video min-h-[300px]"
        }`}
      >
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="/brand/full-logo-with-background.webp"
          alt="Thalluvandi fallback logo"
          fill
          sizes={isThumbnail ? "80px" : "(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"}
          className="object-contain p-8 opacity-40 z-20"
        />
      </div>
    );
  }

  if (isThumbnail) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="80px"
        loading="lazy"
        className="object-cover"
        onError={() => {
          setError(true);
        }}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={600}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      priority={priority}
      loading={priority ? undefined : "lazy"}
      className="object-contain max-h-[550px] w-auto h-auto max-w-full mx-auto rounded-2xl"
      onError={() => {
        setError(true);
      }}
    />
  );
}

export function CartGallery({ images, nameEn }: { images: string[]; nameEn: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fade, setFade] = useState(false);

  const handleThumbnailClick = (index: number) => {
    if (index === activeIndex) return;
    setFade(true);
    setTimeout(() => {
      setActiveIndex(index);
      setFade(false);
    }, 150); // half of the 300ms transition for smooth crossfade
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Dynamic Large Image Container */}
      <div className="w-full flex justify-center">
        <div
          className={`relative overflow-hidden rounded-2xl border border-black/10 bg-[#fff7ed] w-fit max-w-full transition-all duration-300 ${
            fade ? "opacity-0 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <GalleryImage
            src={images[activeIndex]}
            alt={`${nameEn} - view ${activeIndex + 1}`}
            isThumbnail={false}
            priority={true}
          />
        </div>
      </div>

      {/* Thumbnail row below */}
      <div className="flex gap-3 justify-center md:justify-start">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => handleThumbnailClick(idx)}
            className={`relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition ${
              idx === activeIndex
                ? "border-primary scale-95 shadow-md"
                : "border-black/10 hover:border-primary/40"
            }`}
            aria-label={`View image ${idx + 1}`}
          >
            <GalleryImage src={img} alt={`${nameEn} thumbnail ${idx + 1}`} isThumbnail={true} />
          </button>
        ))}
      </div>
    </div>
  );
}
