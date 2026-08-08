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
          className="well flex-shrink-0 w-[72px] h-[72px] overflow-hidden p-2"
        >
          {productImage ? (
            <Image
              src={productImage.url}
              alt={productImage.altText || title}
              width={72}
              height={72}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${product.handle}`}
            onClick={closeCart}
            className="text-product caps-tight block text-ink line-clamp-1 transition-colors hover:text-ink-mid"
          >
            {product.title}
          </Link>

          {variantDisplay && (
            <p className="text-body-sm text-ink-low mt-1">{variantDisplay}</p>
          )}

          <p className="text-price tabular-nums text-ink mt-1.5">
            {formatPrice(line.cost.totalAmount.amount)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end justify-between">
          <div className="flex items-center gap-1 border border-line p-0.5">
            <button
              onClick={() => handleUpdateQuantity(line.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center leading-none text-ink-mid hover:text-ink active:scale-95 duration-[120ms]"
              style={{ transition: 'color 200ms var(--ease-out), transform 120ms var(--ease-out)' }}
              aria-label="Decrease quantity"
              disabled={isPending}
            >
              −
            </button>
            <span className="w-6 text-center text-product text-ink">
              {line.quantity}
            </span>
            <button
              onClick={() => handleUpdateQuantity(line.quantity + 1)}
              className="w-6 h-6 flex items-center justify-center leading-none text-ink-mid hover:text-ink active:scale-95 duration-[120ms]"
              style={{ transition: 'color 200ms var(--ease-out), transform 120ms var(--ease-out)' }}
              aria-label="Increase quantity"
              disabled={isPending}
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="caps text-label-sm text-ink-low underline transition-colors hover:text-ink"
            disabled={isPending}
          >
            Remove
          </button>
        </div>
      </div>

      {error && (
        <p className="text-danger text-label-sm ml-20 mb-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
