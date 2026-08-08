import type { FullProduct } from './types';

export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
);

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Celestial Lights',
    url: baseUrl.href,
  };
}

export function productJsonLd(product: FullProduct) {
  const firstVariant = product.variants[0];
  const image = product.featuredImage || product.images[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: image ? image.url : undefined,
    description: product.descriptionHtml.replace(/<[^>]*>/g, ''),
    url: `${baseUrl}products/${product.handle}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: firstVariant.price.currencyCode,
      price: firstVariant.price.amount,
      availability: firstVariant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; href: string }[]
) {
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
      __html: JSON.stringify(data),
    },
  };
}
