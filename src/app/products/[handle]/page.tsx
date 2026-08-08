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

      <div className="mx-auto max-w-7xl gutter section-tight">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <Gallery images={images} title={product.title} />

          <div className="lg:sticky lg:top-24">
            {/* No product-type eyebrow above the title: the heading carries
                its own weight, and the category is already in the nav and
                the breadcrumb structured data. */}
            <h1 className="caps mb-8 text-display-lg text-ink">
              {product.title}
            </h1>

            <PurchasePanel product={product} />

            {/* Legacy Shopify description HTML — scoped so imported markup
                (oversized images, raw tables) cannot break the layout. */}
            {product.descriptionHtml && (
              <div className="mt-10 border-t border-line pt-8">
                <h2 className="caps mb-5 text-label text-ink">Details</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  className="max-w-[68ch] overflow-hidden text-body text-ink-mid [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_div]:max-w-full [&_h1]:mt-6 [&_h1]:text-body-lg [&_h1]:text-ink [&_h2]:mt-6 [&_h2]:text-body-lg [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-body [&_h3]:text-ink [&_img]:my-5 [&_img]:h-auto [&_img]:w-full [&_img]:max-w-full [&_li]:my-1 [&_li]:text-ink-mid [&_p]:my-3 [&_p]:text-ink-mid [&_strong]:font-semibold [&_strong]:text-ink [&_table]:w-full [&_table]:border-collapse [&_table]:text-body-sm [&_td]:border [&_td]:border-line [&_td]:p-2.5 [&_th]:border [&_th]:border-line [&_th]:p-2.5 [&_th]:text-left [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5"
                />
              </div>
            )}
          </div>
        </div>

        <ProductRecommendations productId={product.id} />
      </div>
    </>
  );
}
