'use client';

import { useRef, useEffect, useState } from 'react';
import { useCart } from './cart-provider';

export function CartButton() {
  const { openCart, cart } = useCart();
  const [isPopping, setIsPopping] = useState(false);
  const prevCountRef = useRef<number>(0);

  const count = cart?.totalQuantity ?? 0;

  // Trigger pop animation when count changes
  useEffect(() => {
    if (count !== prevCountRef.current) {
      setIsPopping(true);
      prevCountRef.current = count;

      // Reset animation state after it completes
      const timer = setTimeout(() => {
        setIsPopping(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <button
      onClick={openCart}
      className="caps text-label whitespace-nowrap py-2 text-ink transition-opacity hover:opacity-60"
      aria-label={`Open cart (${count} items)`}
    >
      <span
        className={`inline-block transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isPopping ? 'scale-110 opacity-70' : 'scale-100 opacity-100'
        }`}
      >
        Bag ({count})
      </span>
    </button>
  );
}
