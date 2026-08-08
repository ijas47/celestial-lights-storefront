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
    <div className="flex items-center gap-3">
      <label htmlFor="sort" className="caps text-label-sm text-ink-mid">
        Sort
      </label>
      <select
        id="sort"
        aria-label="Sort products"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="caps-tight text-label cursor-pointer border-0 border-b border-ink bg-transparent px-0 py-1 text-ink transition-colors"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
}
