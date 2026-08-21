import 'server-only';
import sharp from 'sharp';
import type { ShopImage } from './types';

const ANALYSIS_SIZE = 50;
const BORDER_DEPTH = 8;
const LIGHT_THRESHOLD = 220;
const LIGHT_RATIO_CUTOFF = 0.75;
const MAX_STD_DEV = 18;

async function isStudioBackground(imageUrl: string): Promise<boolean> {
  try {
    const smallUrl = imageUrl.includes('?')
      ? `${imageUrl}&width=100`
      : `${imageUrl}?width=100`;

    const response = await fetch(smallUrl);
    if (!response.ok) return false;

    const buffer = Buffer.from(await response.arrayBuffer());
    const { data, info } = await sharp(buffer)
      .resize(ANALYSIS_SIZE, ANALYSIS_SIZE, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    let lightCount = 0;
    let borderCount = 0;
    let brightnessSum = 0;
    let brightnessSqSum = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const isBorder =
          x < BORDER_DEPTH ||
          x >= width - BORDER_DEPTH ||
          y < BORDER_DEPTH ||
          y >= height - BORDER_DEPTH;
        if (!isBorder) continue;

        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r + g + b) / 3;

        borderCount++;
        brightnessSum += brightness;
        brightnessSqSum += brightness * brightness;

        if (r > LIGHT_THRESHOLD && g > LIGHT_THRESHOLD && b > LIGHT_THRESHOLD) {
          lightCount++;
        }
      }
    }

    if (borderCount === 0) return false;

    const lightRatio = lightCount / borderCount;
    const mean = brightnessSum / borderCount;
    const variance = brightnessSqSum / borderCount - mean * mean;
    const stdDev = Math.sqrt(Math.max(0, variance));

    return lightRatio > LIGHT_RATIO_CUTOFF && stdDev < MAX_STD_DEV;
  } catch {
    return false;
  }
}

export async function filterWhiteBackgroundImages(
  images: ShopImage[]
): Promise<ShopImage[]> {
  if (images.length <= 1) return images;

  const results = await Promise.all(
    images.map(async (img) => ({
      image: img,
      isWhite: await isStudioBackground(img.url),
    }))
  );

  const filtered = results.filter((r) => !r.isWhite).map((r) => r.image);
  return filtered.length > 0 ? filtered : images;
}
