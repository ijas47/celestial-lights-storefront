'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { ShopImage } from '@/lib/types';

interface GalleryProps {
  images: ShopImage[];
  title: string;
}

export function Gallery({ images, title }: GalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrevious = useCallback(() => {
    setActiveIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-card overflow-hidden bg-night-800 flex items-center justify-center">
        <div className="text-ember-300/40 text-4xl">✦</div>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div>
      {/* Main viewport */}
      <div
        className="relative aspect-square rounded-card overflow-hidden bg-night-800"
        tabIndex={0}
        aria-label={`${title} gallery — use arrow keys`}
        role="region"
      >
        <Image
          key={`image-${activeIndex}`}
          src={activeImage.url}
          alt={activeImage.altText ?? title}
          fill
          sizes="(max-width:1024px) 100vw, 50vw"
          preload={activeIndex === 0}
          className="object-cover animate-fade-in"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pt-3">
          {images.map((image, index) => (
            <button
              key={`thumb-${index}`}
              onClick={() => setActiveIndex(index)}
              className={`w-16 h-16 relative rounded overflow-hidden border transition-colors flex-shrink-0 focus-visible:ring focus-visible:ring-ember-500 ${
                index === activeIndex
                  ? 'border-ember-400'
                  : 'border-line hover:border-line-strong'
              }`}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === activeIndex}
            >
              <Image
                src={image.url}
                alt={image.altText ?? `${title} thumbnail ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
