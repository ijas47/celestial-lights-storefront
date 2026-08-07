import Link from 'next/link';
import type { ProductCardData } from '@/lib/types';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductCard } from '@/components/product/product-card';
import { buttonClasses } from '@/components/ui/button';

interface FeaturedRowProps {
  title: string;
  categorySlug: string;
  products: ProductCardData[];
}

export function FeaturedRow({ title, categorySlug, products }: FeaturedRowProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <SectionHeading
        title={title}
        action={
          <Link
            href={`/collections/${categorySlug}`}
            className={`${buttonClasses('ghost', 'md')} text-ember-300 text-sm hover:text-ember-200 focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:outline-none`}
          >
            View all →
          </Link>
        }
      />

      {/* Horizontal scroll container */}
      <div className="overflow-x-auto pb-2 snap-x snap-mandatory">
        <style>{`
          .featured-row-scroll::-webkit-scrollbar { display: none; }
          .featured-row-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <div className="featured-row-scroll flex gap-4">
          {products.map((product, idx) => (
            <div key={product.id} className="w-64 shrink-0 snap-start">
              <ProductCard
                product={product}
                preloadImage={idx < 2}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
