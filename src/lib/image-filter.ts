import 'server-only';
import type { ShopImage } from './types';

export async function filterUnwantedImages(
  images: ShopImage[]
): Promise<ShopImage[]> {
  return images;
}
