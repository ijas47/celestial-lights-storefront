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
      <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h1 className="font-display text-2xl text-text-hi mb-6">
          {categoryData.name}
        </h1>
        <p className="text-text-mid mb-6">No more products to display.</p>
        <Link
          href={`/collections/${categoryData.slug}`}
          className="inline-block px-4 py-2 border border-line-strong rounded-pill text-sm text-text-mid hover:border-ember-500 transition-colors"
        >
          Back to {categoryData.name}
        </Link>
      </div>
    );
  }

  // No products in category (shouldn't happen)
  if (products.length === 0 && !after) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h1 className="font-display text-2xl text-text-hi mb-6">
          {categoryData.name}
        </h1>
        <p className="text-text-mid mb-8">No products found in this category.</p>
        <div className="flex gap-4 flex-wrap">
          {CATEGORIES.filter((c) => c.slug !== category)
            .slice(0, 5)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="px-4 py-2 bg-night-800 border border-line rounded-pill text-sm text-text-mid hover:border-ember-500 transition-colors"
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

      {/* Hero Banner */}
      <div className="border-b border-line hero-aurora">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <h1 className="font-display text-4xl text-text-hi mb-2">
            {categoryData.name}
          </h1>
          <p className="text-text-mid max-w-xl">
            {categoryData.description}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-text-low text-sm">
          Showing {productCount} products
        </p>
        <SortSelect current={sort} />
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
