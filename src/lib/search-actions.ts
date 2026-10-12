'use server';

import { searchCatalogue } from '@/lib/catalogue';
import type { Product } from '@/lib/types';

export async function predictiveSearchAction(q: string): Promise<Product[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];
  return searchCatalogue(trimmed).slice(0, 8);
}
