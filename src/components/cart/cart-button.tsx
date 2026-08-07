'use client';

import { useRef, useEffect, useState } from 'react';
import { useCart } from './cart-provider';

export function CartButton() {
  const { openCart, cart } = useCart();
  const [isScaling, setIsScaling] = useState(false);
  const prevCountRef = useRef<number>(0);

  const count = cart?.totalQuantity ?? 0;

  // Trigger scale animation when count changes
  useEffect(() => {
    if (count !== prevCountRef.current) {
      setIsScaling(true);
      prevCountRef.current = count;

      // Reset animation state after it completes
      const timer = setTimeout(() => {
        setIsScaling(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <button
      onClick={openCart}
      className="p-2 hover:bg-night-800 rounded-lg transition-colors relative text-text-hi focus-visible:ring-1 ring-ember-500 outline-none"
      aria-label={`Open cart (${count} items)`}
    >
      <svg
        className="w-5 h-5 stroke-current"
        fill="none"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {count > 0 && (
        <span
          key={count}
          className={`absolute -top-1 -right-1 bg-ember-400 text-night-950 text-[10px] font-semibold rounded-pill min-w-4 h-4 px-1 flex items-center justify-center transition-transform duration-200 ${
            isScaling ? 'scale-125' : 'scale-100'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
