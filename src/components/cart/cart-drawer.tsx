'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from './cart-provider';
import { CartLineItem } from './cart-line-item';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/format';

export function CartDrawer() {
  const { cart, isOpen, closeCart, pending } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeCart]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Set initial focus
      setTimeout(() => closeButtonRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;

    const panel = panelRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = panel.querySelectorAll(
        'button, a, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const first = focusableElements[0] as HTMLElement;
      const last = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    panel.addEventListener('keydown', handleKeyDown);
    return () => panel.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const isEmpty = !pending && (!cart || cart.lines.length === 0);
  const hasItems = !pending && cart && cart.lines.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-ink/20 transition-opacity duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] pointer-events-none ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 inset-y-0 z-50 w-full max-w-md bg-paper border-l border-ink flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-line-strong">
          <h2 className="caps text-label text-ink">
            Bag ({cart?.totalQuantity ?? 0})
          </h2>
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            className="text-display-md text-ink-mid transition-colors hover:text-ink"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {pending && !cart ? (
            // Loading state
            <div className="p-5 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-16 h-16 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            // Empty state
            <div className="flex flex-col items-center justify-center p-5 py-16 text-center">
              <p className="caps text-label text-ink mb-5">Your bag is empty</p>
              <Link
                href="/collections/chandeliers"
                onClick={closeCart}
                className="rule-link"
              >
                Shop chandeliers
              </Link>
            </div>
          ) : hasItems && cart ? (
            // Cart lines
            <div className="divide-y divide-line px-5">
              {cart.lines.map((line) => (
                <CartLineItem key={line.id} line={line} />
              ))}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {hasItems && cart && (
          <div className="border-t border-line p-5 space-y-3">
            {/* Subtotal */}
            <div className="flex items-baseline justify-between">
              <span className="caps text-label-sm text-ink-mid">Subtotal</span>
              <span className="text-price tabular-nums text-ink">
                {formatPrice(cart.cost.subtotalAmount.amount)}
              </span>
            </div>

            {/* Checkout button */}
            <a
              href={cart.checkoutUrl}
              className="btn-solid flex w-full items-center justify-center px-8 py-4 text-label text-center"
            >
              Checkout · {formatPrice(cart.cost.totalAmount.amount)}
            </a>

            {/* Microcopy */}
            <p className="caps text-label-sm text-ink-low text-center">
              Secure checkout via Shopify
            </p>
          </div>
        )}
      </div>
    </>
  );
}
