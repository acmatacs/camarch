"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface ImageGalleryProps {
  featuredImage: string;
  galleryImages: string[];
  templeName: string;
}

export default function ImageGallery({
  featuredImage,
  galleryImages,
  templeName,
}: ImageGalleryProps) {
  const allImages = [featuredImage, ...galleryImages].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const prevLightbox = useCallback(
    () => setLightboxIndex((i) => (i === 0 ? allImages.length - 1 : i - 1)),
    [allImages.length]
  );
  const nextLightbox = useCallback(
    () => setLightboxIndex((i) => (i === allImages.length - 1 ? 0 : i + 1)),
    [allImages.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
      if (e.key === "ArrowRight") nextLightbox();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, closeLightbox, prevLightbox, nextLightbox]);

  return (
    <>
      {/* ─── Main Image ─── */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg bg-charcoal/5 cursor-zoom-in" onClick={() => openLightbox(activeIndex)}>
        <Image
          src={allImages[activeIndex]}
          alt={`${templeName} — image ${activeIndex + 1}`}
          fill
          priority
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        {/* Image counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white font-body text-xs px-2.5 py-1 rounded-full">
          {activeIndex + 1} / {allImages.length}
        </div>
        {/* Expand icon */}
        <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white p-2 rounded-lg">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </div>
      </div>

      {/* ─── Thumbnail Strip ─── */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-thin">
          {allImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all duration-200 ${
                i === activeIndex
                  ? "ring-2 ring-gold ring-offset-1 opacity-100"
                  : "opacity-60 hover:opacity-90"
              }`}
            >
              <Image
                src={src}
                alt={`${templeName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* ─── Lightbox ─── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev */}
          {allImages.length > 1 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); prevLightbox(); }}
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Main Image */}
          <div
            className="relative w-full max-w-5xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxIndex]}
              alt={`${templeName} — full view ${lightboxIndex + 1}`}
              width={1280}
              height={720}
              className="object-contain w-full max-h-[85vh] rounded-lg"
              sizes="85vw"
            />
            <p className="text-center font-body text-xs text-white/40 mt-3">
              {templeName} &mdash; {lightboxIndex + 1} / {allImages.length}
            </p>
          </div>

          {/* Next */}
          {allImages.length > 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors"
              onClick={(e) => { e.stopPropagation(); nextLightbox(); }}
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
