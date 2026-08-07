'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden p-2 text-text-mid hover:text-text-hi transition-colors"
        aria-label="Open menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Menu */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-night-950/80 backdrop-blur lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            className="fixed inset-0 z-50 bg-night-950/95 backdrop-blur overflow-y-auto lg:hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-line">
              <div className="font-display text-lg font-bold text-text-hi">
                Celestial Lights
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-text-mid hover:text-text-hi transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-4 space-y-0">
              {CATEGORIES.map((cat, index) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="font-display text-xl font-display text-text-hi hover:text-ember-300 transition-colors py-3 block animate-fade-up"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {cat.shortName || cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
