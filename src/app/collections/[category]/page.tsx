import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CATEGORIES, getCategory } from '@/lib/categories';
import { getCategoryProducts } from '@/lib/shopify';
import { breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';
import { ProductGrid } from '@/components/product/product-grid';
import { SortSelect } from '@/components/product/sort-select';
import { LoadMore } from '@/components/product/load-more';
import type { SortOption } from '@/lib/types';
import Link from 'next/link';

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string; after?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categoryData = getCategory(category);

  if (!categoryData) {
    return {};
  }

  return {
    title: categoryData.name,
    description: categoryData.description,
    alternates: {
      canonical: `/collections/${categoryData.slug}`,
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = await params;
  const { sort: rawSort, after } = await searchParams;

  const categoryData = getCategory(category);
  if (!categoryData) {
    notFound();
  }

  // Type-safe sort validation
  const validSorts = ['featured', 'price-asc', 'price-desc', 'newest'] as const;
  const sort: SortOption = validSorts.includes(rawSort as SortOption)
    ? (rawSort as SortOption)
    : 'featured';

  const { products, hasNextPage, endCursor } = await getCategoryProducts(
    category,
    {
      first: 24,
      after: after || undefined,
      sort,
    }
  );

  // No more products on subsequent pages
  if (after && products.length === 0) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto gutter py-12">
        <h1 className="mb-6 text-display-lg text-ink">
          {categoryData.name}
        </h1>
        <p className="mb-6 text-ink-mid">No more products to display.</p>
        <Link href={`/collections/${categoryData.slug}`} className="rule-link">
          Back to {categoryData.name}
        </Link>
      </div>
    );
  }

  // No products in category (shouldn't happen)
  if (products.length === 0 && !after) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto gutter py-12">
        <h1 className="mb-6 text-display-lg text-ink">
          {categoryData.name}
        </h1>
        <p className="mb-8 text-ink-mid">No products found in this category.</p>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.filter((c) => c.slug !== category)
            .slice(0, 5)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="caps-tight text-label border border-line px-4 py-2 text-ink transition-colors hover:border-ink"
              >
                {c.shortName || c.name}
              </Link>
            ))}
        </div>
      </div>
    );
  }

  const breadcrumb = [
    { name: 'Home', href: '/' },
    { name: categoryData.name, href: `/collections/${categoryData.slug}` },
  ];

  const productCount = products.length + (hasNextPage ? '+' : '');

  return (
    <>
      <script
        {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumb))}
      />

      {/* Page header */}
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto gutter pt-12 pb-6">
          <h1 className="text-display-lg text-ink">
            {categoryData.name}
          </h1>
          <p className="mt-4 max-w-[52ch] text-ink-mid">
            {categoryData.description}
          </p>

          {/* Toolbar */}
          <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="caps text-label-sm text-ink-low">
              Showing {productCount} products
            </p>
            <SortSelect current={sort} />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGrid products={products} preloadCount={4} />

      {/* Pagination */}
      {hasNextPage && endCursor && (
        <LoadMore
          href={`/collections/${categoryData.slug}?${
            sort !== 'featured' ? `sort=${sort}&` : ''
          }after=${encodeURIComponent(endCursor)}`}
        />
      )}
    </>
  );
}
