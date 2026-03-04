"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface MediaLightboxProps {
  /** Array of image URLs to display */
  images: string[];
  /** Alt text prefix — will be suffixed with index number */
  altPrefix?: string;
  /** Optional: show as a grid (true) or just a single triggered thumbnail (false) */
  grid?: boolean;
}

/**
 * MediaLightbox — renders a thumbnail grid.
 * Clicking any thumbnail opens the yet-another-react-lightbox viewer.
 * Only PUBLIC media should be passed to this component on public pages.
 */
export default function MediaLightbox({
  images,
  altPrefix = "Image",
  grid = true,
}: MediaLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (images.length === 0) return null;

  const slides = images.map((src, i) => ({ src, alt: `${altPrefix} ${i + 1}` }));

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  return (
    <>
      {grid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => openAt(i)}
              className="relative aspect-square rounded-lg overflow-hidden bg-charcoal/5 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-jungle/40"
              aria-label={`${altPrefix} ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${altPrefix} ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Overlay hint on hover */}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors">
                <svg
                  className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0zM10.5 7.5v6m3-3h-6" />
                </svg>
              </span>
            </button>
          ))}
        </div>
      ) : (
        // Single trigger mode — just show first image
        <button
          onClick={() => openAt(0)}
          className="relative w-full aspect-video rounded-xl overflow-hidden bg-charcoal/5 hover:opacity-95 transition-opacity"
          aria-label={`${altPrefix} 1`}
        >
          <Image src={images[0]} alt={`${altPrefix} 1`} fill className="object-cover" unoptimized />
        </button>
      )}

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        styles={{ container: { backgroundColor: "rgba(0,0,0,0.92)" } }}
      />
    </>
  );
}
