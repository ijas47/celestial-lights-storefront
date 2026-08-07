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

  // Calculate total savings
  const totalSavings = hasItems && cart
    ? cart.lines.reduce((sum, line) => {
        const compareAt = Number(line.merchandise.compareAtPrice?.amount || 0);
        const price = Number(line.merchandise.price.amount);
        const savings = Math.max(0, (compareAt - price) * line.quantity);
        return sum + savings;
      }, 0)
    : 0;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-night-950/70 transition-opacity duration-300 pointer-events-none ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 inset-y-0 z-50 w-full max-w-md bg-night-900 border-l border-line-strong flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-line-strong">
          <h2 className="text-xl font-display text-text-hi">Your Cart</h2>
          <button
            ref={closeButtonRef}
            onClick={closeCart}
            className="text-2xl text-text-mid hover:text-text-hi transition-colors focus-visible:ring-1 ring-ember-500 outline-none rounded"
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
            <div className="flex flex-col items-center justify-center p-5 py-12 text-center">
              <div className="text-4xl mb-4">✦</div>
              <p className="text-text-hi font-medium mb-2">
                Your cart is empty
              </p>
              <p className="text-text-mid text-sm mb-6">
                Explore our collection of premium chandeliers
              </p>
              <Link
                href="/collections/chandeliers"
                onClick={closeCart}
                className="text-ember-300 hover:text-ember-400 transition-colors text-sm font-medium"
              >
                Explore Chandeliers
              </Link>
            </div>
          ) : hasItems && cart ? (
            // Cart lines
            <div className="divide-y divide-line">
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
            <div className="flex justify-between text-sm">
              <span className="text-text-mid">Subtotal</span>
              <span className="text-text-hi font-tabular-nums">
                {formatPrice(cart.cost.subtotalAmount.amount)}
              </span>
            </div>

            {/* Savings */}
            {totalSavings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success">You save</span>
                <span className="text-success font-tabular-nums">
                  {formatPrice(String(totalSavings))}
                </span>
              </div>
            )}

            {/* Checkout button */}
            <a
              href={cart.checkoutUrl}
              className="block w-full py-3 px-4 rounded-pill text-center font-medium transition-all bg-gradient-to-b from-ember-300 to-ember-400 text-night-950 hover:brightness-110 focus-visible:ring-1 ring-ember-500 outline-none"
            >
              Checkout · {formatPrice(cart.cost.totalAmount.amount)}
            </a>

            {/* Microcopy */}
            <p className="text-xs text-text-low text-center">
              Secure checkout via Shopify · UPI, cards & netbanking
            </p>
          </div>
        )}
      </div>
    </>
  );
}
