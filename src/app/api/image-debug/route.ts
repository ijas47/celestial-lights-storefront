import { NextResponse } from 'next/server';
import { shopifyFetch } from '@/lib/shopify';
import sharp from 'sharp';
import type { ShopImage } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SIZE = 100;
const WB_BORDER = 16;
const WB_BRIGHT = 220;
const WM_CENTER_R = 20;
const WM_EDGE_BORDER = 10;

type ImageAnalysis = {
  url: string;
  altText: string | null;
  thumbnail: string;
  whiteBg: {
    borderLightRatio: number;
    borderBrightnessMean: number;
    borderBrightnessStd: number;
    isWhite: boolean;
  };
  watermark: {
    centerMean: number;
    centerStd: number;
    edgeMean: number;
    edgeStd: number;
    brightnessDiff: number;
    centerLaplacian: number;
    edgeLaplacian: number;
    stdScore: number;
    diffScore: number;
    lapScore: number;
    totalScore: number;
    isWatermarked: boolean;
  };
  currentVerdict: 'kept' | 'removed-white' | 'removed-watermark';
};

async function analyzeImageDetailed(imageUrl: string): Promise<Omit<ImageAnalysis, 'url' | 'altText' | 'currentVerdict'> | null> {
  try {
    const url = imageUrl.includes('?')
      ? `${imageUrl}&width=200`
      : `${imageUrl}?width=200`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());

    const thumbBuf = await sharp(buf)
      .resize(80, 80, { fit: 'cover' })
      .jpeg({ quality: 60 })
      .toBuffer();
    const thumbnail = `data:image/jpeg;base64,${thumbBuf.toString('base64')}`;

    const { data, info } = await sharp(buf)
      .resize(SIZE, SIZE, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width: w, height: h, channels: ch } = info;

    const grey = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      grey[i] = Math.round(
        (data[i * ch] + data[i * ch + 1] + data[i * ch + 2]) / 3
      );
    }

    let lightCount = 0;
    let borderCount = 0;
    let bSum = 0;
    let bSqSum = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (
          x >= WB_BORDER && x < w - WB_BORDER &&
          y >= WB_BORDER && y < h - WB_BORDER
        ) continue;

        const idx = (y * w + x) * ch;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r + g + b) / 3;

        borderCount++;
        bSum += brightness;
        bSqSum += brightness * brightness;

        if (r > WB_BRIGHT && g > WB_BRIGHT && b > WB_BRIGHT) {
          lightCount++;
        }
      }
    }

    const borderLightRatio = borderCount > 0 ? lightCount / borderCount : 0;
    const borderMean = borderCount > 0 ? bSum / borderCount : 0;
    const borderVariance = borderCount > 0 ? bSqSum / borderCount - borderMean * borderMean : 0;
    const borderStd = Math.sqrt(Math.max(0, borderVariance));

    const cx = w >> 1;
    const cy = h >> 1;
    const cr = WM_CENTER_R;
    const cr2 = cr * cr;
    const bd = WM_EDGE_BORDER;

    let cSum = 0, cSq = 0, cN = 0;
    let eSum = 0, eSq = 0, eN = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = grey[y * w + x];
        const dx = x - cx;
        const dy = y - cy;

        if (dx * dx + dy * dy <= cr2) {
          cSum += v;
          cSq += v * v;
          cN++;
        }
        if (x < bd || x >= w - bd || y < bd || y >= h - bd) {
          eSum += v;
          eSq += v * v;
          eN++;
        }
      }
    }

    const cMean = cN > 0 ? cSum / cN : 0;
    const cStd = Math.sqrt(Math.max(0, cN > 0 ? cSq / cN - cMean * cMean : 0));
    const eMean = eN > 0 ? eSum / eN : 0;
    const eStd = Math.sqrt(Math.max(0, eN > 0 ? eSq / eN - eMean * eMean : 0));
    const bDiff = cMean - eMean;

    let cLap = 0, cLapN = 0;
    let eLap = 0, eLapN = 0;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const lap = Math.abs(
          4 * grey[i] - grey[(y - 1) * w + x] - grey[(y + 1) * w + x] - grey[i - 1] - grey[i + 1]
        );

        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= cr2) {
          cLap += lap;
          cLapN++;
        }
        if (y < bd || y >= h - bd) {
          eLap += lap;
          eLapN++;
        }
      }
    }

    const avgCLap = cLapN > 0 ? cLap / cLapN : 0;
    const avgELap = eLapN > 0 ? eLap / eLapN : 0;

    const stdScore = (eStd > 0 && cStd < eStd * 0.8) ? 1.0 : 0;
    const diffScore = (bDiff >= 3 && bDiff <= 50) ? 0.5 : 0;
    const lapScore = (avgELap > 0 && avgCLap > avgELap * 1.2) ? 1.0 : 0;
    const totalScore = stdScore + diffScore + lapScore;

    return {
      thumbnail,
      whiteBg: {
        borderLightRatio: Math.round(borderLightRatio * 1000) / 1000,
        borderBrightnessMean: Math.round(borderMean * 10) / 10,
        borderBrightnessStd: Math.round(borderStd * 10) / 10,
        isWhite: borderLightRatio > 0.75 && borderStd < 18,
      },
      watermark: {
        centerMean: Math.round(cMean * 10) / 10,
        centerStd: Math.round(cStd * 10) / 10,
        edgeMean: Math.round(eMean * 10) / 10,
        edgeStd: Math.round(eStd * 10) / 10,
        brightnessDiff: Math.round(bDiff * 10) / 10,
        centerLaplacian: Math.round(avgCLap * 10) / 10,
        edgeLaplacian: Math.round(avgELap * 10) / 10,
        stdScore,
        diffScore,
        lapScore,
        totalScore,
        isWatermarked: totalScore >= 1.0,
      },
    };
  } catch {
    return null;
  }
}

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const perPage = parseInt(searchParams.get('perPage') ?? '5');
  const filterType = searchParams.get('filter') ?? 'all';

  const allProducts: {
    handle: string;
    title: string;
    images: ShopImage[];
  }[] = [];

  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: ProductsResponse = await shopifyFetch<ProductsResponse>({
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
        images,
      });
    }

    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  const productAnalyses: {
    handle: string;
    title: string;
    totalImages: number;
    keptCount: number;
    removedCount: number;
    images: ImageAnalysis[];
  }[] = [];

  for (const product of allProducts) {
    if (product.images.length === 0) continue;

    const imageResults: ImageAnalysis[] = [];

    for (const img of product.images) {
      const analysis = await analyzeImageDetailed(img.url);
      if (!analysis) continue;

      let verdict: ImageAnalysis['currentVerdict'] = 'kept';
      if (analysis.watermark.isWatermarked) {
        verdict = 'removed-watermark';
      } else if (analysis.whiteBg.isWhite) {
        verdict = 'removed-white';
      }

      imageResults.push({
        url: img.url,
        altText: img.altText,
        ...analysis,
        currentVerdict: verdict,
      });
    }

    const keptCount = imageResults.filter(r => r.currentVerdict === 'kept').length;
    const removedCount = imageResults.filter(r => r.currentVerdict !== 'kept').length;

    if (filterType === 'affected' && removedCount === 0) continue;
    if (filterType === 'all-removed' && keptCount > 0) continue;
    if (filterType === 'false-positives' && removedCount === 0) continue;

    productAnalyses.push({
      handle: product.handle,
      title: product.title,
      totalImages: product.images.length,
      keptCount,
      removedCount,
      images: imageResults,
    });
  }

  const startIdx = (page - 1) * perPage;
  const pageItems = productAnalyses.slice(startIdx, startIdx + perPage);
  const totalPages = Math.ceil(productAnalyses.length / perPage);

  return NextResponse.json({
    page,
    perPage,
    totalPages,
    totalProducts: productAnalyses.length,
    filter: filterType,
    products: pageItems,
  });
}
