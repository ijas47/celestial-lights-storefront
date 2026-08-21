import { NextResponse } from 'next/server';
import sharp from 'sharp';

const ANALYSIS_SIZE = 100;
const CENTER_FRACTION = 0.40;

function meanBrightness(data: Buffer, indices: number[]): number {
  let sum = 0;
  for (const idx of indices) sum += data[idx];
  return sum / indices.length;
}

function stdDevBrightness(data: Buffer, indices: number[]): number {
  const mean = meanBrightness(data, indices);
  let sumSq = 0;
  for (const idx of indices) {
    const d = data[idx] - mean;
    sumSq += d * d;
  }
  return Math.sqrt(sumSq / indices.length);
}

function localContrastVariance(data: Buffer, width: number, height: number, blockSize = 5) {
  const stdDevs: number[] = [];
  for (let by = 0; by <= height - blockSize; by += blockSize) {
    for (let bx = 0; bx <= width - blockSize; bx += blockSize) {
      const indices: number[] = [];
      for (let dy = 0; dy < blockSize; dy++)
        for (let dx = 0; dx < blockSize; dx++)
          indices.push((by + dy) * width + (bx + dx));
      stdDevs.push(stdDevBrightness(data, indices));
    }
  }
  const avg = stdDevs.reduce((a, b) => a + b, 0) / stdDevs.length;
  const variance = stdDevs.reduce((a, b) => a + (b - avg) ** 2, 0) / stdDevs.length;
  return { avgLocalStdDev: avg, localStdDevVariance: variance };
}

function radialProfile(data: Buffer, width: number, height: number) {
  const cx = width / 2, cy = height / 2;
  const maxR = Math.min(cx, cy) * 0.95;
  const profile: { radius: number; mean: number; std: number }[] = [];
  for (let ri = 0; ri < 20; ri++) {
    const r = (ri + 1) * maxR / 20;
    const vals: number[] = [];
    for (let si = 0; si < 36; si++) {
      const a = (2 * Math.PI * si) / 36;
      const px = Math.round(cx + r * Math.cos(a));
      const py = Math.round(cy + r * Math.sin(a));
      if (px >= 0 && px < width && py >= 0 && py < height) vals.push(data[py * width + px]);
    }
    if (vals.length === 0) continue;
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length);
    profile.push({ radius: r, mean, std });
  }
  return profile;
}

function edgeMag(data: Buffer, width: number, height: number, x0: number, y0: number, x1: number, y1: number) {
  let sum = 0, count = 0;
  for (let y = Math.max(1, y0); y < Math.min(height - 1, y1); y++) {
    for (let x = Math.max(1, x0); x < Math.min(width - 1, x1); x++) {
      const c = data[y * width + x];
      sum += Math.abs(
        4 * c - data[(y - 1) * width + x] - data[(y + 1) * width + x] -
        data[y * width + x - 1] - data[y * width + x + 1]
      );
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
}

interface AnalysisResult {
  label: string;
  hasWatermark: boolean;
  score: number;
  reasons: string[];
  metrics: Record<string, number>;
}

async function analyzeImageFromUrl(imageUrl: string, label: string): Promise<AnalysisResult> {
  const smallUrl = imageUrl.includes('?') ? `${imageUrl}&width=200` : `${imageUrl}?width=200`;
  const response = await fetch(smallUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${smallUrl}`);
  const buffer = Buffer.from(await response.arrayBuffer());

  const { data, info } = await sharp(buffer)
    .resize(ANALYSIS_SIZE, ANALYSIS_SIZE, { fit: 'cover' })
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const margin = Math.round(width * (1 - CENTER_FRACTION) / 2);
  const cx0 = margin, cy0 = margin, cx1 = width - margin, cy1 = height - margin;

  const centerIdx: number[] = [], edgeIdx: number[] = [];
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (x >= cx0 && x < cx1 && y >= cy0 && y < cy1) centerIdx.push(i);
      else edgeIdx.push(i);
    }

  const cMean = meanBrightness(data, centerIdx);
  const eMean = meanBrightness(data, edgeIdx);
  const cStd = stdDevBrightness(data, centerIdx);
  const eStd = stdDevBrightness(data, edgeIdx);
  const bDiff = cMean - eMean;

  const centerData = Buffer.alloc((cx1 - cx0) * (cy1 - cy0));
  for (let y = cy0; y < cy1; y++)
    for (let x = cx0; x < cx1; x++)
      centerData[(y - cy0) * (cx1 - cx0) + (x - cx0)] = data[y * width + x];
  const cLC = localContrastVariance(centerData, cx1 - cx0, cy1 - cy0, 5);

  const rp = radialProfile(data, width, height);
  let radialEdges = 0, maxRDiff = 0;
  for (let i = 1; i < rp.length; i++) {
    const d = Math.abs(rp[i].mean - rp[i - 1].mean);
    if (d > 5) { radialEdges++; maxRDiff = Math.max(maxRDiff, d); }
  }

  const cEM = edgeMag(data, width, height, cx0, cy0, cx1, cy1);
  const tEM = edgeMag(data, width, height, 0, 0, width, cy0);
  const bEM = edgeMag(data, width, height, 0, cy1, width, height);

  let score = 0;
  const reasons: string[] = [];
  if (Math.abs(bDiff) > 3 && Math.abs(bDiff) < 30) { score += 1; reasons.push(`center-edge brightness diff: ${bDiff.toFixed(1)}`); }
  if (cStd < eStd * 0.85) { score += 1; reasons.push(`center std (${cStd.toFixed(1)}) < edge std (${eStd.toFixed(1)})`); }
  if (radialEdges >= 1 && radialEdges <= 5) { score += 1; reasons.push(`${radialEdges} radial edges (max diff: ${maxRDiff.toFixed(1)})`); }
  if (cEM > tEM * 1.2 || cEM > bEM * 1.2) { score += 1; reasons.push(`elevated center edge mag (${cEM.toFixed(1)}) vs border (${tEM.toFixed(1)}/${bEM.toFixed(1)})`); }
  if (cLC.localStdDevVariance < 50) { score += 0.5; reasons.push(`low center local contrast variance: ${cLC.localStdDevVariance.toFixed(1)}`); }

  return {
    label,
    hasWatermark: score >= 2.5,
    score,
    reasons,
    metrics: {
      centerMean: +cMean.toFixed(2), edgeMean: +eMean.toFixed(2),
      centerStd: +cStd.toFixed(2), edgeStd: +eStd.toFixed(2),
      brightnessDiff: +bDiff.toFixed(2),
      centerEdgeMag: +cEM.toFixed(2), topEdgeMag: +tEM.toFixed(2), bottomEdgeMag: +bEM.toFixed(2),
      centerLCVariance: +cLC.localStdDevVariance.toFixed(2),
      radialEdgeCount: radialEdges, maxRadialDiff: +maxRDiff.toFixed(2),
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Missing ?handle= parameter' }, { status: 400 });
  }

  // Define image sets for known products
  const imageSets: Record<string, { label: string; url: string }[]> = {
    'equator-modernist-dining-chandelier': [
      { label: 'equator_00', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/00_5ab6d5be-f574-49a5-b0db-79e58254534b.webp' },
      { label: 'equator_0', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/0_547e4a89-9452-444f-b293-ab38df61ed28.webp' },
      { label: 'equator_1_2', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/1_2_d16bdc0a-00f1-46e4-9c47-e42f4522e689.webp' },
      { label: 'equator_1_3', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/1_3_5b70d545-9e2f-42cc-aed5-14d041a2b264.webp' },
      { label: 'equator_1_4', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/1_4_2a40527a-d833-48b4-8b94-1afa854e56dc.webp' },
      { label: 'equator_2_2', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/2_2_814dfd7b-eb76-40da-8b42-5aaf127ab8c7.webp' },
      { label: 'equator_2', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/2_deb44802-de3a-4f22-977f-1bb3c8213757.webp' },
      { label: 'equator_SIZE', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/SIZE_66f173ca-e3ea-4204-a842-d38015e88bbc.webp' },
    ],
    'chirpy-round-chandelier': [
      { label: 'chirpy_3Bird1', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround3Bird1.webp' },
      { label: 'chirpy_3Bird2', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround3Bird2.webp' },
      { label: 'chirpy_3Bird3', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround3Bird3.webp' },
      { label: 'chirpy_3Bird', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround3Bird_46240984-02cb-448c-937f-9fa33ad5a7ac.webp' },
      { label: 'chirpy_6Bird', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround6Bird.webp' },
      { label: 'chirpy_6Bird1', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround6Bird1.webp' },
      { label: 'chirpy_6Bird2', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround6Bird2.webp' },
      { label: 'chirpy_6Bird3', url: 'https://cdn.shopify.com/s/files/1/0810/5338/4889/files/Chirpyround6Bird3_76ff4f07-de88-4d8b-9708-329fb999e4b3.webp' },
    ],
  };

  const images = imageSets[handle];
  if (!images) {
    return NextResponse.json({ error: `Unknown product handle: ${handle}. Use: ${Object.keys(imageSets).join(', ')}` }, { status: 400 });
  }

  const results: (AnalysisResult | { label: string; error: string })[] = [];

  for (const { label, url } of images) {
    try {
      const result = await analyzeImageFromUrl(url, label);
      results.push(result);
    } catch (err) {
      results.push({ label, error: (err as Error).message });
    }
  }

  const successResults = results.filter((r): r is AnalysisResult => 'hasWatermark' in r);
  const watermarked = successResults.filter(r => r.hasWatermark);
  const clean = successResults.filter(r => !r.hasWatermark);

  return NextResponse.json({
    product: handle,
    totalImages: images.length,
    analyzed: successResults.length,
    watermarkedCount: watermarked.length,
    cleanCount: clean.length,
    results,
    summary: {
      watermarkedLabels: watermarked.map(r => r.label),
      cleanLabels: clean.map(r => r.label),
    },
  });
}
