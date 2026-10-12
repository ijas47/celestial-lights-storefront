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
    if (value === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
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
        <option value="model">Model A to Z</option>
      </select>
    </div>
  );
}
