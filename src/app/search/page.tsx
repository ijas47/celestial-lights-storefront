import { Metadata } from 'next';
import Link from 'next/link';
import { searchCatalogue } from '@/lib/catalogue';
import { ProductCard } from '@/components/product/product-card';
import { CATEGORIES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Search',
  robots: {
    index: false,
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

const popularCategories = CATEGORIES.filter((category) =>
  ['chandeliers', 'hanging-pendant', 'wall-lights'].includes(category.slug)
);

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  if (!q) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <section className="section">
          <div className="mx-auto max-w-7xl gutter text-center">
            <h1 className="text-label text-ink mb-4">Search the Catalog</h1>
            <p className="text-ink-mid">
              Press{' '}
              <kbd className="px-2 py-1 border border-line-strong text-ink-mid">⌘K</kbd>{' '}
              to search or browse by category below
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl gutter py-16">
          <h2 className="text-label text-ink mb-8 text-center">The range</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="border border-line hover:bg-well transition-colors p-8 text-center"
              >
                <h3 className="text-body-sm text-ink">{cat.name}</h3>
                <p className="text-body text-ink-mid mt-2">{cat.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const products = searchCatalogue(q);

  if (products.length === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <section className="section">
          <div className="mx-auto max-w-7xl gutter text-center">
            <h1 className="text-label text-ink mb-8">Nothing found</h1>
            <p className="text-ink-mid mb-12">
              Try a model code or browse the range
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 max-w-2xl mx-auto">
              {popularCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="rule-link text-ink"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <section className="section-tight">
        <div className="mx-auto max-w-7xl gutter">
          <h1 className="text-label text-ink mb-8">
            Results for &ldquo;{q}&rdquo;
          </h1>
          <div className="grid-products">
            {products.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                preloadImage={index < 4}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
