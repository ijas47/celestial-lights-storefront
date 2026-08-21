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

async function analyzeImageDetailed(imageUrl: string) {
  try {
    const url = imageUrl.includes('?')
      ? `${imageUrl}&width=200`
      : `${imageUrl}?width=200`;

    const res = await fetch(url);
    if (!res.ok) return null;

    const buf = Buffer.from(await res.arrayBuffer());

    const thumbBuf = await sharp(buf)
      .resize(60, 60, { fit: 'cover' })
      .jpeg({ quality: 50 })
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
        if (x >= WB_BORDER && x < w - WB_BORDER && y >= WB_BORDER && y < h - WB_BORDER) continue;
        const idx = (y * w + x) * ch;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        borderCount++;
        bSum += brightness;
        bSqSum += brightness * brightness;
        if (data[idx] > WB_BRIGHT && data[idx + 1] > WB_BRIGHT && data[idx + 2] > WB_BRIGHT) {
          lightCount++;
        }
      }
    }

    const borderLightRatio = borderCount > 0 ? lightCount / borderCount : 0;
    const borderMean = borderCount > 0 ? bSum / borderCount : 0;
    const borderStd = Math.sqrt(Math.max(0, borderCount > 0 ? bSqSum / borderCount - borderMean * borderMean : 0));

    const cx = w >> 1, cy = h >> 1, cr = WM_CENTER_R, cr2 = cr * cr, bd = WM_EDGE_BORDER;
    let cSum = 0, cSq = 0, cN = 0, eSum = 0, eSq = 0, eN = 0;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const v = grey[y * w + x];
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy <= cr2) { cSum += v; cSq += v * v; cN++; }
        if (x < bd || x >= w - bd || y < bd || y >= h - bd) { eSum += v; eSq += v * v; eN++; }
      }
    }

    const cMean = cN > 0 ? cSum / cN : 0;
    const cStd = Math.sqrt(Math.max(0, cN > 0 ? cSq / cN - cMean * cMean : 0));
    const eMean = eN > 0 ? eSum / eN : 0;
    const eStd = Math.sqrt(Math.max(0, eN > 0 ? eSq / eN - eMean * eMean : 0));
    const bDiff = cMean - eMean;

    let cLap = 0, cLapN = 0, eLap = 0, eLapN = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const lap = Math.abs(4 * grey[i] - grey[(y - 1) * w + x] - grey[(y + 1) * w + x] - grey[i - 1] - grey[i + 1]);
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy <= cr2) { cLap += lap; cLapN++; }
        if (y < bd || y >= h - bd) { eLap += lap; eLapN++; }
      }
    }

    const avgCLap = cLapN > 0 ? cLap / cLapN : 0;
    const avgELap = eLapN > 0 ? eLap / eLapN : 0;

    const stdScore = (eStd > 0 && cStd < eStd * 0.8) ? 1.0 : 0;
    const diffScore = (bDiff >= 3 && bDiff <= 50) ? 0.5 : 0;
    const lapScore = (avgELap > 0 && avgCLap > avgELap * 1.2) ? 1.0 : 0;
    const totalScore = stdScore + diffScore + lapScore;

    const isWhite = borderLightRatio > 0.75 && borderStd < 18;
    const isWatermarked = totalScore >= 1.0;

    let verdict: string = 'kept';
    if (isWatermarked) verdict = 'removed-watermark';
    else if (isWhite) verdict = 'removed-white';

    return {
      thumbnail,
      verdict,
      wb: { ratio: +(borderLightRatio.toFixed(3)), mean: +(borderMean.toFixed(1)), std: +(borderStd.toFixed(1)), isWhite },
      wm: {
        cMean: +(cMean.toFixed(1)), cStd: +(cStd.toFixed(1)),
        eMean: +(eMean.toFixed(1)), eStd: +(eStd.toFixed(1)),
        bDiff: +(bDiff.toFixed(1)),
        cLap: +(avgCLap.toFixed(1)), eLap: +(avgELap.toFixed(1)),
        scores: { std: stdScore, diff: diffScore, lap: lapScore, total: totalScore },
        isWatermarked,
      },
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  const batch = parseInt(searchParams.get('batch') ?? '1');
  const batchSize = 10;

  if (handle) {
    const data = await shopifyFetch<{
      product: { handle: string; title: string; images: { edges: { node: ShopImage }[] } } | null;
    }>({
      query: `query P($h: String!) { product(handle: $h) { handle title images(first: 20) { edges { node { url altText width height } } } } }`,
      variables: { h: handle },
      revalidate: 0,
    });

    if (!data.product) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const images = await Promise.all(
      data.product.images.edges.map(async (e: { node: ShopImage }) => {
        const analysis = await analyzeImageDetailed(e.node.url);
        return { url: e.node.url, altText: e.node.altText, ...analysis };
      })
    );

    return NextResponse.json({
      handle: data.product.handle,
      title: data.product.title,
      totalImages: images.length,
      kept: images.filter(i => i.verdict === 'kept').length,
      removedWm: images.filter(i => i.verdict === 'removed-watermark').length,
      removedWb: images.filter(i => i.verdict === 'removed-white').length,
      images,
    });
  }

  type BatchResponse = {
    products: {
      edges: { node: { handle: string; title: string; images: { edges: { node: ShopImage }[] } } }[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };

  let cursor: string | null = null;
  let currentBatch = 1;

  while (currentBatch < batch) {
    const skip: BatchResponse = await shopifyFetch<BatchResponse>({
      query: `query P($first: Int!, $after: String) { products(first: $first, after: $after) { edges { node { handle } } pageInfo { hasNextPage endCursor } } }`,
      variables: { first: batchSize, after: cursor },
      revalidate: 0,
    });
    cursor = skip.products.pageInfo.endCursor;
    if (!skip.products.pageInfo.hasNextPage) break;
    currentBatch++;
  }

  const data = await shopifyFetch<BatchResponse>({
    query: `query P($first: Int!, $after: String) { products(first: $first, after: $after) { edges { node { handle title images(first: 20) { edges { node { url altText width height } } } } } pageInfo { hasNextPage endCursor } } }`,
    variables: { first: batchSize, after: cursor },
    revalidate: 0,
  });

  const results = await Promise.all(
    data.products.edges.map(async (edge) => {
      const images = await Promise.all(
        edge.node.images.edges.map(async (e: { node: ShopImage }) => {
          const analysis = await analyzeImageDetailed(e.node.url);
          return { url: e.node.url, altText: e.node.altText, ...analysis };
        })
      );
      return {
        handle: edge.node.handle,
        title: edge.node.title,
        totalImages: images.length,
        kept: images.filter(i => i.verdict === 'kept').length,
        removedWm: images.filter(i => i.verdict === 'removed-watermark').length,
        removedWb: images.filter(i => i.verdict === 'removed-white').length,
        images,
      };
    })
  );

  return NextResponse.json({
    batch,
    batchSize,
    hasMore: data.products.pageInfo.hasNextPage,
    products: results,
  });
}
