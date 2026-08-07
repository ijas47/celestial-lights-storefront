import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/categories';
import { getAllProductHandles } from '@/lib/shopify';
import { baseUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const allHandles = await getAllProductHandles();

    const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
      url: new URL(`/collections/${category.slug}`, baseUrl).toString(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

    const productUrls: MetadataRoute.Sitemap = allHandles.map((product) => ({
      url: new URL(`/products/${product.handle}`, baseUrl).toString(),
      lastModified: new Date(product.updatedAt),
      priority: 0.6,
    }));

    return [
      {
        url: baseUrl.toString(),
        priority: 1,
      },
      ...categoryUrls,
      ...productUrls,
    ];
  } catch {
    // Fallback to basic sitemap if product fetch fails
    return [
      {
        url: baseUrl.toString(),
        priority: 1,
      },
      ...CATEGORIES.map((category) => ({
        url: new URL(`/collections/${category.slug}`, baseUrl).toString(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
    ];
  }
}
