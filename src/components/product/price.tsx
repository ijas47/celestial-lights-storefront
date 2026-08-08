import { formatPrice } from '@/lib/format';

interface PriceProps {
  amount: string;
  compareAtAmount?: string | null;
  currencyCode?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Quiet pricing, by design decision: selling price in ink, MRP struck in grey.
 * No percent-off badge. This system carries no accent colour, and discount
 * badges are the first thing that would cheapen it.
 */
export function Price({
  amount,
  compareAtAmount,
  currencyCode = 'INR',
  size = 'md',
}: PriceProps) {
  const hasCompare =
    compareAtAmount != null && Number(compareAtAmount) > Number(amount);

  const isLarge = size === 'lg';

  return (
    <div className="flex items-baseline gap-2.5">
      <span
        className={`tabular-nums text-ink ${
          isLarge ? 'text-price-lg' : 'text-price'
        }`}
      >
        {formatPrice(amount, currencyCode)}
      </span>
      {hasCompare && (
        <span
          className={`tabular-nums text-ink-mid line-through ${
            isLarge ? 'text-body' : 'text-body-sm'
          }`}
        >
          {formatPrice(compareAtAmount, currencyCode)}
        </span>
      )}
    </div>
  );
}
