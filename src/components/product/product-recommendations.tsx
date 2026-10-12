import { relatedProducts } from '@/lib/catalogue';
import type { Product } from '@/lib/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductCard } from './product-card';

interface ProductRecommendationsProps {
  product: Product;
}

export function ProductRecommendations({ product }: ProductRecommendationsProps) {
  const recommendations = relatedProducts(product, 8);
  if (recommendations.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl gutter section-tight">
      <SectionHeading title="You may also like" />
      <div className="grid-products">
        {recommendations.map((item) => (
          <ProductCard key={item.slug} product={item} />
        ))}
      </div>
    </section>
  );
}
