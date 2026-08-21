import 'server-only';
import sharp from 'sharp';
import type { ShopImage } from './types';

const ANALYSIS_SIZE = 50;
const BORDER_DEPTH = 5;
const WHITE_THRESHOLD = 240;
const WHITE_RATIO_CUTOFF = 0.85;

async function isWhiteBackground(imageUrl: string): Promise<boolean> {
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

    let whiteCount = 0;
    let borderCount = 0;

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

        borderCount++;
        if (r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD) {
          whiteCount++;
        }
      }
    }

    return borderCount > 0 && whiteCount / borderCount > WHITE_RATIO_CUTOFF;
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
      isWhite: await isWhiteBackground(img.url),
    }))
  );

  const filtered = results.filter((r) => !r.isWhite).map((r) => r.image);
  return filtered.length > 0 ? filtered : images;
}
