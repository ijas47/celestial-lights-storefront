import type { MetadataRoute } from 'next';
import { CATEGORIES } from '@/lib/categories';
import { getAllProducts } from '@/lib/catalogue';
import { baseUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: new URL(`/collections/${category.slug}`, baseUrl).toString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productUrls: MetadataRoute.Sitemap = getAllProducts().map((product) => ({
    url: new URL(`/products/${product.slug}`, baseUrl).toString(),
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
}
