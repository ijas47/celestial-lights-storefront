import { formatPrice, discountPercent } from '@/lib/format';

interface PriceProps {
  amount: string;
  compareAtAmount?: string | null;
  currencyCode?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Price({
  amount,
  compareAtAmount,
  currencyCode = 'INR',
  size = 'md',
}: PriceProps) {
  const discount = discountPercent(amount, compareAtAmount);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className="flex items-baseline gap-2">
      <span className={`text-ember-300 tabular-nums font-medium ${sizeClasses[size]}`}>
        {formatPrice(amount, currencyCode)}
      </span>
      {compareAtAmount && Number(compareAtAmount) > Number(amount) && (
        <>
          <span className="text-text-low line-through text-xs">
            {formatPrice(compareAtAmount, currencyCode)}
          </span>
          {discount !== null && (
            <span className="text-success text-xs font-semibold">
              {discount}% off
            </span>
          )}
        </>
      )}
    </div>
  );
}
