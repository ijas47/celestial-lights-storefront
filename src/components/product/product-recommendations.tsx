import { getRecommendations } from '@/lib/shopify';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductCard } from './product-card';

interface ProductRecommendationsProps {
  productId: string;
}

export async function ProductRecommendations({
  productId,
}: ProductRecommendationsProps) {
  const recommendations = await getRecommendations(productId);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl gutter section-tight">
      <SectionHeading title="You may also like" />
      <div className="grid-products">
        {recommendations.slice(0, 8).map((product) => (
          <ProductCard
            key={product.handle}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
