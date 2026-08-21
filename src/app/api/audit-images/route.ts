import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import { filterUnwantedImages } from '@/lib/image-filter';
import type { ShopImage } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  const allProducts: {
    handle: string;
    title: string;
    imageCount: number;
    images: ShopImage[];
  }[] = [];

  let cursor: string | null = null;
  let hasNext = true;

  type ProductsResponse = {
    products: {
      edges: {
        node: {
          handle: string;
          title: string;
          images: { edges: { node: ShopImage }[] };
        };
      }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };

  while (hasNext) {
    const data: ProductsResponse = await shopifyFetch<{
      products: {
        edges: {
          node: {
            handle: string;
            title: string;
            images: { edges: { node: ShopImage }[] };
          };
        }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    }>({
      query: `
        query AllProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            edges {
              node {
                handle
                title
                images(first: 20) {
                  edges {
                    node {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      variables: { first: 50, after: cursor },
      revalidate: 0,
    });

    for (const edge of data.products.edges) {
      const images = edge.node.images.edges.map((e: { node: ShopImage }) => e.node);
      allProducts.push({
        handle: edge.node.handle,
        title: edge.node.title,
        imageCount: images.length,
        images,
      });
    }

    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  const results = await Promise.all(
    allProducts.map(async (p) => {
      const filtered = await filterUnwantedImages(p.images);
      return {
        handle: p.handle,
        title: p.title,
        originalCount: p.imageCount,
        filteredCount: filtered.length,
        allRemoved: p.imageCount > 0 && filtered.length === 0,
      };
    })
  );

  const noImages = results.filter((r) => r.allRemoved);
  const hadNoImages = results.filter((r) => r.originalCount === 0);
  const partial = results.filter(
    (r) => r.filteredCount > 0 && r.filteredCount < r.originalCount
  );

  return NextResponse.json({
    totalProducts: results.length,
    productsWithAllImagesRemoved: noImages.length,
    productsWithNoOriginalImages: hadNoImages.length,
    productsWithSomeRemoved: partial.length,
    productsUnchanged: results.filter(
      (r) => r.filteredCount === r.originalCount
    ).length,
    allRemoved: noImages.map((r) => ({
      handle: r.handle,
      title: r.title,
      originalCount: r.originalCount,
    })),
    partiallyFiltered: partial.map((r) => ({
      handle: r.handle,
      title: r.title,
      kept: r.filteredCount,
      removed: r.originalCount - r.filteredCount,
    })),
  });
}
