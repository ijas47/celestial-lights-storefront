'use client';

import { useTransition, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CartLine } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useCart } from './cart-provider';
import { updateLineAction, removeLineAction } from '@/lib/cart-actions';

interface CartLineItemProps {
  line: CartLine;
}

export function CartLineItem({ line }: CartLineItemProps) {
  const { setCart, closeCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { merchandise } = line;
  const {
    title,
    selectedOptions,
    image,
    product,
  } = merchandise;

  const productImage = image || product.featuredImage;

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity < 0) return;

    setError(null);
    startTransition(async () => {
      const result = await updateLineAction(line.id, newQuantity);

      if ('error' in result) {
        setError(result.error);
      } else {
        setCart(result.cart);
      }
    });
  };

  const handleRemove = () => {
    setError(null);
    startTransition(async () => {
      const result = await removeLineAction(line.id);

      if ('error' in result) {
        setError(result.error);
      } else {
        setCart(result.cart);
      }
    });
  };

  const variantDisplay =
    selectedOptions
      .filter((opt) => opt.value !== 'Default Title')
      .map((opt) => opt.value)
      .join(' / ') || null;

  return (
    <div className={isPending ? 'opacity-50 pointer-events-none' : ''}>
      <div className="flex gap-3 py-4">
        {/* Product Image */}
        <Link
          href={`/products/${product.handle}`}
          onClick={closeCart}
          className="flex-shrink-0 w-16 h-16 bg-night-800 rounded overflow-hidden focus-visible:ring-1 ring-ember-500 outline-none"
        >
          {productImage ? (
            <Image
              src={productImage.url}
              alt={productImage.altText || title}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-night-700" />
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${product.handle}`}
            onClick={closeCart}
            className="block text-sm text-text-hi line-clamp-1 hover:text-ember-300 transition-colors focus-visible:ring-1 ring-ember-500 outline-none rounded"
          >
            {product.title}
          </Link>

          {variantDisplay && (
            <p className="text-xs text-text-low mt-0.5">{variantDisplay}</p>
          )}

          <p className="text-sm font-tabular-nums text-text-hi mt-1">
            {formatPrice(line.cost.totalAmount.amount)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-1 border border-line rounded-pill p-0.5">
            <button
              onClick={() => handleUpdateQuantity(line.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center leading-none text-text-mid hover:text-text-hi focus-visible:ring-1 ring-ember-500 outline-none transition-colors"
              aria-label="Decrease quantity"
              disabled={isPending}
            >
              −
            </button>
            <span className="w-6 text-center text-xs font-medium text-text-hi">
              {line.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(line.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center leading-none text-text-mid hover:text-text-hi focus-visible:ring-1 ring-ember-500 outline-none transition-colors"
              aria-label="Increase quantity"
              disabled={isPending}
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="text-xs text-text-low underline hover:text-danger transition-colors focus-visible:ring-1 ring-ember-500 outline-none rounded"
            disabled={isPending}
          >
            Remove
          </button>
        </div>
      </div>

      {error && (
        <p className="text-danger text-xs ml-20 mb-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
