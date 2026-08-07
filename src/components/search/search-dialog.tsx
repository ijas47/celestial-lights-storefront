'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { predictiveSearchAction } from '@/lib/search-actions';
import { formatPrice } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import type { ProductCardData } from '@/lib/types';

export function SearchTrigger() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('cl:open-search'));
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 hover:bg-night-800 rounded-lg transition-colors text-text-mid hover:text-text-hi"
      aria-label="Search"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  );
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductCardData[]>([]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Handle open event and keyboard shortcuts
  useEffect(() => {
    const handleOpenSearch = () => setOpen(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };

    window.addEventListener('cl:open-search', handleOpenSearch);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('cl:open-search', handleOpenSearch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await predictiveSearchAction(query);
        setResults(data);
      });
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, startTransition]);

  const handleResultClick = () => {
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleEnter = () => {
    if (query.trim().length > 0) {
      handleResultClick();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-night-950/80 animate-fade-in backdrop-blur"
        onClick={() => setOpen(false)}
      />

      {/* Dialog Panel */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none mt-[10vh]">
        <div className="pointer-events-auto w-full max-w-xl mx-auto px-4">
          <div
            className="bg-night-800 border border-line-strong rounded-card overflow-hidden shadow-2xl animate-fade-up"
            style={{
              transition: 'transform 200ms, opacity 200ms',
              transform: 'scale(1)',
              opacity: 1,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            {/* Search Input */}
            <div className="border-b border-line p-4">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEnter();
                  }
                }}
                placeholder="Search chandeliers, wall lights…"
                className="w-full bg-transparent text-text-hi placeholder-text-low outline-none text-base"
              />
            </div>

            {/* Results or Empty State */}
            <div className="max-h-96 overflow-y-auto">
              {pending ? (
                /* Loading State */
                <div className="p-4 space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-12 h-12 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length > 0 ? (
                /* Results */
                <div className="p-2">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.handle}`}
                      onClick={handleResultClick}
                    >
                      <div className="flex gap-3 p-3 rounded-lg hover:bg-night-700 transition-colors cursor-pointer">
                        {/* Image */}
                        <div className="w-12 h-12 rounded flex-shrink-0 bg-night-700 overflow-hidden">
                          {product.featuredImage ? (
                            <Image
                              src={product.featuredImage.url}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-low text-sm">
                              ✦
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="line-clamp-1 text-sm font-medium text-text-hi">
                            {product.title}
                          </div>
                          <div className="text-xs text-text-mid mt-1">
                            {formatPrice(product.priceRange.minVariantPrice.amount)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : query.trim().length >= 2 ? (
                /* Empty State */
                <div className="p-8 text-center">
                  <p className="text-text-mid">
                    No matches for "{query}"
                  </p>
                </div>
              ) : (
                /* Idle Hint */
                <div className="p-8 text-center">
                  <p className="text-text-low text-sm">
                    Start typing to search the catalog…
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {query.trim().length > 0 && (
              <div className="border-t border-line px-4 py-3 text-xs text-text-low bg-night-900/50">
                Press <kbd className="px-1.5 py-0.5 rounded border border-line-strong bg-night-800">↵</kbd> to see all results
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
