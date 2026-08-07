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
    <section className="mx-auto max-w-7xl px-4 md:px-6 py-14">
      <SectionHeading title="You may also like" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
