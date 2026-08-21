import { NextResponse } from 'next/server';
import sharp from 'sharp';

const SIZE = 100;
const WM_CENTER_R = 20;
const WM_EDGE_BORDER = 10;
const WB_BORDER = 16;
const WB_BRIGHT = 220;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  if (!handle) return NextResponse.json({ error: 'handle required' });

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!domain || !token) return NextResponse.json({ error: 'no shopify config' });

  const res = await fetch(`https://${domain}/api/2025-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Shopify-Storefront-Private-Token': token,
    },
    body: JSON.stringify({
      query: `query($handle: String!) {
        product(handle: $handle) {
          title
          images(first: 20) { edges { node { url altText width height } } }
        }
      }`,
      variables: { handle },
    }),
  });

  const json = await res.json();
  const product = json.data?.product;
  if (!product) return NextResponse.json({ error: 'product not found' });

  const images = product.images.edges.map((e: { node: { url: string } }) => e.node);
  const results = [];

  for (const img of images) {
    try {
      const url = img.url.includes('?') ? `${img.url}&width=200` : `${img.url}?width=200`;
      const imgRes = await fetch(url);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const { data, info } = await sharp(buf)
        .resize(SIZE, SIZE, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { width: w, height: h, channels: ch } = info;
      const grey = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) {
        grey[i] = Math.round((data[i * ch] + data[i * ch + 1] + data[i * ch + 2]) / 3);
      }

      const cx = w >> 1, cy = h >> 1;
      const cr = WM_CENTER_R, cr2 = cr * cr, bd = WM_EDGE_BORDER;

      let cSum = 0, cSq = 0, cN = 0;
      let eSum = 0, eSq = 0, eN = 0;
      let wbLight = 0, wbCount = 0, wbSum = 0, wbSqSum = 0;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const v = grey[y * w + x];
          const dx = x - cx, dy = y - cy;
          if (dx * dx + dy * dy <= cr2) { cSum += v; cSq += v * v; cN++; }
          if (x < bd || x >= w - bd || y < bd || y >= h - bd) { eSum += v; eSq += v * v; eN++; }
          if (x < WB_BORDER || x >= w - WB_BORDER || y < WB_BORDER || y >= h - WB_BORDER) {
            const idx = (y * w + x) * ch;
            const r = data[idx], g = data[idx + 1], b = data[idx + 2];
            const br = (r + g + b) / 3;
            wbCount++; wbSum += br; wbSqSum += br * br;
            if (r > WB_BRIGHT && g > WB_BRIGHT && b > WB_BRIGHT) wbLight++;
          }
        }
      }

      const cMean = cSum / cN;
      const cStd = Math.sqrt(Math.max(0, cSq / cN - cMean * cMean));
      const eMean = eSum / eN;
      const eStd = Math.sqrt(Math.max(0, eSq / eN - eMean * eMean));
      const bDiff = cMean - eMean;

      let lcSum = 0, lcSq = 0, lcN = 0;
      for (let y = cy - cr; y <= cy + cr; y++) {
        for (let x = cx - cr; x <= cx + cr; x++) {
          if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) continue;
          const ddx = x - cx, ddy = y - cy;
          if (ddx * ddx + ddy * ddy > cr2) continue;
          const i = y * w + x;
          const v = grey[i];
          const lc = Math.max(
            Math.abs(v - grey[(y - 1) * w + x]),
            Math.abs(v - grey[(y + 1) * w + x]),
            Math.abs(v - grey[i - 1]),
            Math.abs(v - grey[i + 1])
          );
          lcSum += lc; lcSq += lc * lc; lcN++;
        }
      }
      const lcMean = lcN > 0 ? lcSum / lcN : 0;
      const lcVar = lcN > 0 ? lcSq / lcN - lcMean * lcMean : 0;

      let cLap = 0, cLapN = 0, eLap = 0, eLapN = 0;
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const i = y * w + x;
          const lap = Math.abs(4 * grey[i] - grey[(y-1)*w+x] - grey[(y+1)*w+x] - grey[i-1] - grey[i+1]);
          const ddx = x - cx, ddy = y - cy;
          if (ddx * ddx + ddy * ddy <= cr2) { cLap += lap; cLapN++; }
          if (y < bd || y >= h - bd) { eLap += lap; eLapN++; }
        }
      }

      const avgCLap = cLapN > 0 ? cLap / cLapN : 0;
      const avgELap = eLapN > 0 ? eLap / eLapN : 0;

      let score = 0;
      const signals: string[] = [];
      if (eStd > 0 && cStd < eStd * 0.8) { score += 1.0; signals.push(`cStd=${cStd.toFixed(1)}<eStd*0.8=${(eStd*0.8).toFixed(1)} (+1.0)`); }
      if (bDiff >= 3 && bDiff <= 50) { score += 0.5; signals.push(`bDiff=${bDiff.toFixed(1)} in [3,50] (+0.5)`); }
      if (avgELap > 0 && avgCLap > avgELap * 1.2) { score += 1.0; signals.push(`cLap=${avgCLap.toFixed(1)}>eLap*1.2=${(avgELap*1.2).toFixed(1)} (+1.0)`); }

      const wbMean = wbCount > 0 ? wbSum / wbCount : 0;
      const wbVar = wbCount > 0 ? wbSqSum / wbCount - wbMean * wbMean : 0;
      const wbStd = Math.sqrt(Math.max(0, wbVar));
      const wbRatio = wbCount > 0 ? wbLight / wbCount : 0;
      const isWhite = wbRatio > 0.75 && wbStd < 18;

      results.push({
        url: img.url.split('/').pop()?.split('?')[0],
        score,
        isWatermarked: score >= 1.0,
        isWhite,
        signals,
        raw: { cMean: +cMean.toFixed(1), eMean: +eMean.toFixed(1), cStd: +cStd.toFixed(1), eStd: +eStd.toFixed(1), bDiff: +bDiff.toFixed(1), lcVar: +lcVar.toFixed(1), avgCLap: +avgCLap.toFixed(1), avgELap: +avgELap.toFixed(1), wbRatio: +wbRatio.toFixed(3), wbStd: +wbStd.toFixed(1) },
      });
    } catch (err) {
      results.push({ url: img.url, error: String(err) });
    }
  }

  return NextResponse.json({ product: product.title, imageCount: images.length, results });
}
