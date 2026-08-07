import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getProduct, shopifyFetch } from '@/lib/shopify';
import { jsonLdScriptProps, productJsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { Gallery } from '@/components/product/gallery';
import { PurchasePanel } from '@/components/product/purchase-panel';
import { ProductRecommendations } from '@/components/product/product-recommendations';

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const data = await shopifyFetch<{
      products: {
        edges: { node: { handle: string } }[];
      };
    }>({
      query: `
        query TopHandles {
          products(first: 24, sortKey: BEST_SELLING) {
            edges {
              node {
                handle
              }
            }
          }
        }
      `,
      revalidate: 86400,
    });

    return data.products.edges.map((edge) => ({
      handle: edge.node.handle,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: 'Product not found',
      robots: { index: false },
    };
  }

  // Strip HTML tags and collapse whitespace for description
  const plainDescription = product.descriptionHtml
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 160);

  return {
    title: product.seo.title ?? product.title,
    description:
      product.seo.description ?? plainDescription,
    alternates: {
      canonical: `/products/${handle}`,
    },
    openGraph: {
      images: product.featuredImage
        ? [product.featuredImage.url]
        : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const images = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  return (
    <>
      <script {...jsonLdScriptProps(productJsonLd(product))} />
      <script
        {...jsonLdScriptProps(
          breadcrumbJsonLd([
            { name: 'Home', href: '/' },
            { name: product.title, href: `/products/${product.handle}` },
          ])
        )}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Gallery */}
          <Gallery images={images} title={product.title} />

          {/* Right: Product info */}
          <div>
            {/* Eyebrow */}
            {product.productType && (
              <div className="text-ember-300 text-xs tracking-[0.15em] uppercase mb-4">
                {product.productType}
              </div>
            )}

            {/* Title */}
            <h1 className="font-display text-3xl md:text-4xl text-text-hi mb-8">
              {product.title}
            </h1>

            {/* Purchase Panel */}
            <PurchasePanel product={product} />

            {/* Description */}
            {product.descriptionHtml && (
              <div className="border-t border-line mt-8 pt-8">
                <div
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  className="[&_p]:text-text-mid [&_p]:leading-relaxed [&_p]:my-3 [&_li]:text-text-mid [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-ember-300 [&_strong]:text-text-hi [&_img]:rounded-card [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto [&_table]:text-sm [&_table]:text-text-mid [&_h1]:text-lg [&_h2]:text-lg [&_h3]:text-base [&_div]:max-w-full overflow-hidden text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <ProductRecommendations productId={product.id} />
      </div>
    </>
  );
}
