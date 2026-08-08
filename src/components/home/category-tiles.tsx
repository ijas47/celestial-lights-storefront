import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

/**
 * Full category index as a typographic list — no tiles, no glyphs.
 * Reads as a table of contents rather than a set of buttons.
 */
export function CategoryTiles() {
  return (
    <section id="categories" className="mx-auto max-w-7xl gutter section">
      <h2 className="caps mb-6 border-b border-line pb-4 text-label text-ink">
        All collections
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/collections/${category.slug}`}
            className="group flex items-baseline justify-between gap-6 border-b border-line py-5"
          >
            <span className="caps text-title text-ink transition-opacity group-hover:opacity-55">
              {category.name}
            </span>
            <span className="caps shrink-0 text-label-sm text-ink-low">
              View
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
