import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CATEGORIES, getCategory } from '@/lib/categories';
import { getByCategory } from '@/lib/catalogue';
import { breadcrumbJsonLd, jsonLdScriptProps } from '@/lib/seo';
import { ProductGrid } from '@/components/product/product-grid';
import { SortSelect } from '@/components/product/sort-select';
import type { SortOption } from '@/lib/types';

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ sort?: string }>;
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

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params;
  const { sort: rawSort } = await searchParams;
  const categoryData = getCategory(category);

  if (!categoryData) {
    notFound();
  }

  const sort: SortOption = rawSort === 'model' ? 'model' : 'featured';
  const products = getByCategory(category, sort);

  if (products.length === 0) {
    return (
      <div className="min-h-screen max-w-7xl mx-auto gutter py-12">
        <h1 className="mb-6 text-display-lg text-ink">{categoryData.name}</h1>
        <p className="mb-8 text-ink-mid">No fittings in this range yet.</p>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.filter((item) => item.slug !== category).map((item) => (
            <Link
              key={item.slug}
              href={`/collections/${item.slug}`}
              className="caps-tight text-label border border-line px-4 py-2 text-ink transition-colors hover:border-ink"
            >
              {item.shortName || item.name}
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

  return (
    <>
      <script {...jsonLdScriptProps(breadcrumbJsonLd(breadcrumb))} />

      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto gutter pt-12 pb-6">
          <h1 className="text-display-lg text-ink">{categoryData.name}</h1>
          <p className="mt-4 max-w-[52ch] text-ink-mid">{categoryData.description}</p>

          <div className="mt-6 flex items-center justify-end">
            <SortSelect current={sort} />
          </div>
        </div>
      </div>

      <ProductGrid products={products} preloadCount={4} />
    </>
  );
}
