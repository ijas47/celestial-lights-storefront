'use server';

import { predictiveSearch } from '@/lib/shopify';
import type { ProductCardData } from '@/lib/types';

export async function predictiveSearchAction(q: string): Promise<ProductCardData[]> {
  const trimmed = q.trim();

  if (trimmed.length < 2) {
    return [];
  }

  try {
    return await predictiveSearch(trimmed);
  } catch {
    return [];
  }
}
