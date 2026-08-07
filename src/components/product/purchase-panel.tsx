'use client';

import { useState, useMemo } from 'react';
import type { FullProduct } from '@/lib/types';
import { Price } from './price';
import { VariantPicker } from './variant-picker';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { Badge } from '@/components/ui/badge';

interface PurchasePanelProps {
  product: FullProduct;
}

export function PurchasePanel({ product }: PurchasePanelProps) {
  const isDefaultOnly =
    product.variants.length === 1 &&
    product.variants[0].title === 'Default Title';

  // Find first available variant as default
  const firstAvailableVariant = product.variants.find(
    (v) => v.availableForSale
  ) ?? product.variants[0];

  const initialSelected = firstAvailableVariant.selectedOptions.reduce(
    (acc, opt) => {
      acc[opt.name] = opt.value;
      return acc;
    },
    {} as Record<string, string>
  );

  const [selected, setSelected] = useState(initialSelected);

  const selectedVariant = useMemo(() => {
    return product.variants.find((v) =>
      v.selectedOptions.every(
        (opt) => selected[opt.name] === opt.value
      )
    );
  }, [selected, product.variants]);

  const handleSelect = (optionName: string, value: string) => {
    setSelected((prev) => ({
      ...prev,
      [optionName]: value,
    }));
  };

  const displayVariant = selectedVariant ?? product.variants[0];

  return (
    <div className="space-y-5 mt-4">
      {/* Price */}
      <div>
        <Price
          size="lg"
          amount={displayVariant.price.amount}
          compareAtAmount={displayVariant.compareAtPrice?.amount}
          currencyCode={displayVariant.price.currencyCode}
        />
        <p className="text-text-low text-xs mt-2">incl. taxes</p>
      </div>

      {/* Variant picker */}
      {!isDefaultOnly && (
        <VariantPicker
          options={product.options}
          variants={product.variants}
          selected={selected}
          onSelect={handleSelect}
        />
      )}

      {/* Sold out badge */}
      {!product.availableForSale && (
        <Badge tone="danger">Sold out</Badge>
      )}

      {/* Add to cart button */}
      <AddToCartButton
        variantId={selectedVariant?.id ?? null}
        availableForSale={selectedVariant?.availableForSale ?? false}
      />

      {/* Trust row */}
      <div className="text-text-low text-xs">
        1-year warranty · Secure checkout · Ships across India
      </div>
    </div>
  );
}
