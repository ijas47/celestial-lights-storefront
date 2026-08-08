import Link from 'next/link';
import type { ProductCardData } from '@/lib/types';
import { ProductCard } from '@/components/product/product-card';

interface FeaturedRowProps {
  title: string;
  categorySlug: string;
  products: ProductCardData[];
  preloadFirst?: boolean;
}

export function FeaturedRow({
  title,
  categorySlug,
  products,
  preloadFirst = false,
}: FeaturedRowProps) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl gutter section-tight">
      <div className="mb-9 flex items-baseline justify-between gap-6 border-b border-line pb-4">
        <h2 className="caps text-label text-ink">{title}</h2>
        <Link href={`/collections/${categorySlug}`} className="rule-link text-ink">
          View all
        </Link>
      </div>

      <div className="grid-products">
        {products.slice(0, 8).map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            preloadImage={preloadFirst && idx < 4}
          />
        ))}
      </div>
    </section>
  );
}
