import type { Product } from './types';

export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
);

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Celestial Lights',
    url: baseUrl.href,
    email: 'support@celestiallights.in',
  };
}

export function productJsonLd(product: Product) {
  const images = product.images.map(
    (image) => new URL(image.src, baseUrl).href
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    sku: product.model,
    description: product.description || product.summary,
    url: new URL(`/products/${product.slug}`, baseUrl).href,
    ...(images.length > 0 ? { image: images } : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.href, baseUrl).href,
    })),
  };
}

export function jsonLdScriptProps(data: object) {
  return {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, '\\u003c'),
    },
  };
}
