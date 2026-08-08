import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

/**
 * Full category index as a typographic list. No tiles, no glyphs.
 * Reads as a table of contents rather than a set of buttons.
 *
 * The row itself is the link, so it carries no "View" label: ten repeated
 * calls-to-action are noise, and in a two-column grid the right-aligned
 * label collided with the next column's name.
 */
export function CategoryTiles() {
  return (
    <section id="categories" className="mx-auto max-w-7xl gutter section">
      <h2 className="caps mb-6 border-b border-line pb-4 text-label text-ink">
        All collections
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-16 lg:gap-x-24">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/collections/${category.slug}`}
            className="group border-b border-line py-5"
          >
            <span className="caps block text-title text-ink transition-opacity group-hover:opacity-55">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
