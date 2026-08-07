import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { SectionHeading } from '@/components/ui/section-heading';

export function CategoryTiles() {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-4 md:px-6 py-16">
      <SectionHeading
        title="Shop by Category"
        subtitle="Ten collections, one warm glow"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/collections/${category.slug}`}
            className="rounded-card border border-line bg-night-800 p-5 min-h-28 flex flex-col justify-between glow-card group focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:outline-none"
          >
            {/* Top-right glyph */}
            <div className="text-right">
              <span className="text-ember-300/60 text-xl">✦</span>
            </div>

            {/* Category Info */}
            <div>
              <h3 className="font-display text-lg text-text-hi mb-1">
                {category.name}
              </h3>
              <p className="line-clamp-2 text-xs text-text-low">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
