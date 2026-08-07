import { Metadata } from 'next';
import Link from 'next/link';
import { searchProducts } from '@/lib/shopify';
import { ProductCard } from '@/components/product/product-card';
import { buttonClasses } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/categories';

export const metadata: Metadata = {
  title: 'Search',
  robots: {
    index: false,
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; after?: string }>;
}

const popularCategories = [
  CATEGORIES.find(c => c.slug === 'chandeliers'),
  CATEGORIES.find(c => c.slug === 'wall-lights'),
  CATEGORIES.find(c => c.slug === 'hanging-pendant'),
].filter(Boolean);

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, after } = await searchParams;

  // No query: show prompt
  if (!q) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <section className="hero-aurora py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-text-hi mb-4">
              Search the Catalog
            </h1>
            <p className="text-text-mid mb-8">
              Press <kbd className="px-2 py-1 rounded border border-line-strong bg-night-800">⌘K</kbd> to search or browse by category below
            </p>
          </div>
        </section>

        {/* Popular Categories */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-display text-2xl font-bold text-text-hi mb-8 text-center">
            Popular Collections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularCategories.map((cat) => (
              <Link
                key={cat?.slug}
                href={`/collections/${cat?.slug}`}
                className="glow-card rounded-card p-8 bg-night-800 hover:bg-night-700 transition-colors text-center"
              >
                <h3 className="font-display text-xl text-text-hi font-bold">
                  {cat?.name}
                </h3>
                <p className="text-sm text-text-mid mt-2">
                  {cat?.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // With query: fetch results (catch only around the fetch — JSX stays outside)
  let results: Awaited<ReturnType<typeof searchProducts>> | null = null;
  try {
    results = await searchProducts(q, { first: 24, after });
  } catch (error) {
    console.error('Search error:', error);
  }

  if (!results) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="font-display text-3xl font-bold text-text-hi mb-4">
              Search unavailable
            </h1>
            <p className="text-text-mid">
              Please try again later
            </p>
          </div>
        </section>
      </div>
    );
  }

  const { products, hasNextPage, endCursor, totalCount } = results;

  // Empty results
  if (products.length === 0) {
    return (
        <div className="min-h-[calc(100vh-8rem)]">
          <section className="py-24 md:py-32">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-text-hi mb-8">
                Nothing found
              </h1>
              <p className="text-text-mid mb-12">
                Try a different search term or browse our collections
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {popularCategories.map((cat) => (
                  <Link
                    key={cat?.slug}
                    href={`/collections/${cat?.slug}`}
                    className="inline-block px-4 py-2 rounded-pill border border-line-strong hover:border-ember-500 text-text-mid hover:text-ember-300 transition-colors text-sm"
                  >
                    {cat?.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
    }

    // Results
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <section className="py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-text-hi mb-2">
                Results for &ldquo;{q}&rdquo;
              </h1>
              <p className="text-text-mid">
                Found {totalCount} product{totalCount !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-12">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  preloadImage={index < 4}
                />
              ))}
            </div>

            {/* Load More */}
            {hasNextPage && (
              <div className="flex justify-center">
                <Link
                  href={`/search?q=${encodeURIComponent(q)}&after=${encodeURIComponent(endCursor || '')}`}
                  className={buttonClasses('outline', 'md')}
                >
                  Show more
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    );
}
