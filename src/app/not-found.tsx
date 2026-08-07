import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { buttonClasses } from '@/components/ui/button';

export default function NotFound() {
  // Get first 4 categories for footer links
  const topCategories = CATEGORIES.slice(0, 4);

  return (
    <section className="hero-aurora min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center flex flex-col items-center">
        {/* 404 Heading */}
        <h1 className="font-display text-6xl md:text-7xl text-glow mb-6">
          404
        </h1>

        {/* Message */}
        <p className="text-text-mid text-lg mb-8">
          This light doesn&apos;t exist — but 800 others do.
        </p>

        {/* Back Button */}
        <Link
          href="/"
          className={`${buttonClasses('ember', 'md')} rounded-full px-6 py-3 text-base mb-12 focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:outline-none`}
        >
          Back to the showroom
        </Link>

        {/* Category Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {topCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className="text-text-mid text-sm hover:text-ember-300 transition-colors focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:rounded focus-visible:px-2 focus-visible:py-1 focus-visible:outline-none"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
