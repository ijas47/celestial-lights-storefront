'use client';

import { useCart } from './cart-provider';

export function CartButton() {
  const { openCart, cart } = useCart();
  const count = cart?.totalQuantity ?? 0;

  return (
    <button
      onClick={openCart}
      className="p-2 hover:bg-night-800 rounded-lg transition-colors relative"
      aria-label="Shopping cart"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-ember-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
          {count}
        </span>
      )}
    </button>
  );
}
