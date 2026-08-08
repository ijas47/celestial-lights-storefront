import type { ProductCardData } from '@/lib/types';
import { ProductCard } from './product-card';

interface ProductGridProps {
  products: ProductCardData[];
  preloadCount?: number;
}

export function ProductGrid({ products, preloadCount = 0 }: ProductGridProps) {
  return (
    <div className="max-w-7xl mx-auto gutter py-8">
      <div className="grid-products">
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
