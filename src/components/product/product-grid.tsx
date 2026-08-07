import type { ProductCardData } from '@/lib/types';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: ProductCardData[];
  preloadCount?: number;
}

export function ProductGrid({ products, preloadCount = 0 }: ProductGridProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            preloadImage={index < preloadCount}
          />
        ))}
      </div>
    </div>
  );
}
