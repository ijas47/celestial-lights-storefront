'use client';

import { useTransition, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from './cart-provider';
import { addToCartAction } from '@/lib/cart-actions';

interface AddToCartButtonProps {
  variantId: string | null;
  availableForSale: boolean;
}

export function AddToCartButton({
  variantId,
  availableForSale,
}: AddToCartButtonProps) {
  const { openCart, setCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !variantId || !availableForSale || isPending;

  const handleAddToCart = () => {
    if (!variantId) return;

    setError(null);
    openCart();

    startTransition(async () => {
      const result = await addToCartAction(variantId);

      if ('error' in result) {
        setError(result.error);
      } else {
        setCart(result.cart);
      }
    });
  };

  let label = 'Add to cart';
  if (!availableForSale) {
    label = 'Sold out';
  } else if (!variantId) {
    label = 'Select options';
  } else if (isPending) {
    label = 'Adding…';
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAddToCart}
        disabled={isDisabled}
        variant="ember"
        size="lg"
        className="w-full transition-opacity"
        style={{
          opacity: isPending ? 0.7 : 1,
        }}
        aria-label={label}
      >
        {label}
      </Button>
      {error && (
        <p
          className="text-danger text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
