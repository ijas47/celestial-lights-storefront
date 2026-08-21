import 'server-only';
import sharp from 'sharp';
import type { ShopImage } from './types';

const SIZE = 100;

const WB_BORDER = 16;
const WB_BRIGHT = 220;
const WB_RATIO = 0.75;
const WB_MAX_STD = 18;

const WM_THRESHOLD = 2.5;
const WM_CENTER_R = 20;
const WM_EDGE_BORDER = 10;

async function analyzeImage(
  imageUrl: string
): Promise<{ isWhite: boolean; isWatermarked: boolean }> {
  try {
    const url = imageUrl.includes('?')
      ? `${imageUrl}&width=200`
      : `${imageUrl}?width=200`;

    const res = await fetch(url);
    if (!res.ok) return { isWhite: false, isWatermarked: false };

    const buf = Buffer.from(await res.arrayBuffer());
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

    return {
      isWhite: detectWhiteBg(data, w, h, ch),
      isWatermarked: detectWatermark(grey, w, h),
    };
  } catch {
    return { isWhite: false, isWatermarked: false };
  }
}

function detectWhiteBg(
  data: Buffer,
  w: number,
  h: number,
  ch: number
): boolean {
  let lightCount = 0;
  let borderCount = 0;
  let bSum = 0;
  let bSqSum = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (
        x >= WB_BORDER &&
        x < w - WB_BORDER &&
        y >= WB_BORDER &&
        y < h - WB_BORDER
      )
        continue;

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

  if (borderCount === 0) return false;

  const ratio = lightCount / borderCount;
  const mean = bSum / borderCount;
  const variance = bSqSum / borderCount - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));

  return ratio > WB_RATIO && std < WB_MAX_STD;
}

function detectWatermark(
  grey: Uint8Array,
  w: number,
  h: number
): boolean {
  const cx = w >> 1;
  const cy = h >> 1;
  const cr = WM_CENTER_R;
  const cr2 = cr * cr;
  const bd = WM_EDGE_BORDER;

  let cSum = 0,
    cSq = 0,
    cN = 0;
  let eSum = 0,
    eSq = 0,
    eN = 0;

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

  if (cN === 0 || eN === 0) return false;

  const cMean = cSum / cN;
  const cStd = Math.sqrt(Math.max(0, cSq / cN - cMean * cMean));
  const eMean = eSum / eN;
  const eStd = Math.sqrt(Math.max(0, eSq / eN - eMean * eMean));
  const bDiff = cMean - eMean;

  let lcSum = 0,
    lcSq = 0,
    lcN = 0;
  for (let y = cy - cr; y <= cy + cr; y++) {
    for (let x = cx - cr; x <= cx + cr; x++) {
      if (x < 1 || x >= w - 1 || y < 1 || y >= h - 1) continue;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > cr2) continue;

      const i = y * w + x;
      const v = grey[i];
      const lc = Math.max(
        Math.abs(v - grey[(y - 1) * w + x]),
        Math.abs(v - grey[(y + 1) * w + x]),
        Math.abs(v - grey[i - 1]),
        Math.abs(v - grey[i + 1])
      );
      lcSum += lc;
      lcSq += lc * lc;
      lcN++;
    }
  }

  const lcMean = lcN > 0 ? lcSum / lcN : 0;
  const lcVar = lcN > 0 ? lcSq / lcN - lcMean * lcMean : 0;

  let cLap = 0,
    cLapN = 0;
  let eLap = 0,
    eLapN = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = Math.abs(
        4 * grey[i] -
          grey[(y - 1) * w + x] -
          grey[(y + 1) * w + x] -
          grey[i - 1] -
          grey[i + 1]
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

  let score = 0;

  if (lcVar < 200) score += 1.5;
  if (eStd > 0 && cStd < eStd * 0.8) score += 1.0;
  if (bDiff >= 3 && bDiff <= 30) score += 0.5;
  if (avgELap > 0 && avgCLap > avgELap * 1.5) score += 0.5;

  return score >= WM_THRESHOLD;
}

export async function filterUnwantedImages(
  images: ShopImage[]
): Promise<ShopImage[]> {
  if (images.length <= 1) return images;

  const results = await Promise.all(
    images.map(async (img) => ({
      image: img,
      ...(await analyzeImage(img.url)),
    }))
  );

  const filtered = results
    .filter((r) => !r.isWhite && !r.isWatermarked)
    .map((r) => r.image);

  return filtered.length > 0 ? filtered : images;
}
