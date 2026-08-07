'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import type { SortOption } from '@/lib/types';

interface SortSelectProps {
  current: SortOption;
}

export function SortSelect({ current }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);

    // Remove the after cursor when sort changes
    params.delete('after');

    // Update sort parameter (remove if default 'featured')
    if (value === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.push(newUrl);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-text-low text-sm">
        Sort:
      </label>
      <select
        id="sort"
        aria-label="Sort products"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-night-800 border border-line rounded-pill text-sm text-text-mid px-4 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ember-500 transition-all cursor-pointer hover:border-line-strong"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
