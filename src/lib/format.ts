export function formatPrice(amount: string | number, currencyCode = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function discountPercent(price: string, compareAt?: string | null): number | null {
  if (!compareAt || compareAt === null) return null;
  const priceNum = Number(price);
  const compareAtNum = Number(compareAt);
  if (compareAtNum <= priceNum) return null;
  return Math.round((1 - priceNum / compareAtNum) * 100);
}
