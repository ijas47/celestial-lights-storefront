'use client';

import { Button } from '@/components/ui/button';

interface AddToCartButtonProps {
  variantId: string | null;
  availableForSale: boolean;
}

export function AddToCartButton({ variantId, availableForSale }: AddToCartButtonProps) {
  const isDisabled = !variantId || !availableForSale;

  return (
    <Button
      disabled={isDisabled}
      className={isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
    >
      Add to cart
    </Button>
  );
}
