import productsJson from '@/data/products.json';
import { getCategory } from './categories';
import type { Product, SortOption } from './types';

const products = productsJson as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getByCategory(slug: string, sort: SortOption = 'featured'): Product[] {
  const list = products.filter((product) => product.categorySlug === slug);
  if (sort === 'model') {
    return [...list].sort((a, b) => a.model.localeCompare(b.model));
  }
  return [...list].sort(
    (a, b) => a.sourcePage - b.sourcePage || a.model.localeCompare(b.model)
  );
}

export function relatedProducts(product: Product, limit = 8): Product[] {
  return getByCategory(product.categorySlug)
    .filter((item) => item.slug !== product.slug)
    .slice(0, limit);
}

export function searchCatalogue(query: string): Product[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return products.filter((product) => {
    const category = getCategory(product.categorySlug);
    const haystack = [
      product.title,
      product.model,
      product.slug,
      product.summary,
      product.description,
      category?.name ?? '',
      category?.shortName ?? '',
      ...product.specs.flatMap((spec) => [spec.label, spec.value]),
    ]
      .join(' ')
      .toLowerCase();

    return terms.every((term) => haystack.includes(term));
  });
}
