import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllProducts, getProduct } from '@/lib/catalogue';
import { getCategory } from '@/lib/categories';
import { jsonLdScriptProps, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { Gallery } from '@/components/product/gallery';
import { PurchasePanel } from '@/components/product/purchase-panel';
import { ProductRecommendations } from '@/components/product/product-recommendations';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return {
      title: 'Product not found',
      robots: { index: false },
    };
  }

  return {
    title: `${product.title}, ${product.model}`,
    description: product.summary,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      images: product.images[0] ? [product.images[0].src] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const category = getCategory(product.categorySlug);

  return (
    <>
      <script {...jsonLdScriptProps(productJsonLd(product))} />
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: 'Home', href: '/' },
            ...(category
              ? [{ name: category.name, href: `/collections/${category.slug}` }]
              : []),
            { name: product.title, href: `/products/${product.slug}` },
          ])
        )}
      />

      <div className="mx-auto max-w-7xl gutter section-tight">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Gallery images={product.images} title={product.title} />

          <div className="lg:sticky lg:top-24">
            <PurchasePanel product={product} />

            {product.description && (
              <div className="mt-10 border-t border-line pt-8">
                <h2 className="caps mb-5 text-label text-ink">Details</h2>
                <p className="max-w-[68ch] text-body text-ink-mid">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        <ProductRecommendations product={product} />
      </div>
    </>
  );
}
