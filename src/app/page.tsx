import Link from 'next/link';
import { getCategoryProducts } from '@/lib/shopify';
import { Hero } from '@/components/home/hero';
import { CategoryTiles } from '@/components/home/category-tiles';
import { FeaturedRow } from '@/components/home/featured-row';
import { buttonClasses } from '@/components/ui/button';

export const revalidate = 3600;

export default async function Home() {
  // Fetch featured rows in parallel
  const [chandeliers, wallLights, pendants] = await Promise.all([
    getCategoryProducts('chandeliers', { first: 12, sort: 'featured' }),
    getCategoryProducts('wall-lights', { first: 12, sort: 'featured' }),
    getCategoryProducts('hanging-pendant', { first: 12, sort: 'featured' }),
  ]);

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* Category Tiles */}
      <CategoryTiles />

      {/* Featured Rows */}
      <FeaturedRow
        title="Signature Chandeliers"
        categorySlug="chandeliers"
        products={chandeliers.products}
      />

      <FeaturedRow
        title="Warm the Walls"
        categorySlug="wall-lights"
        products={wallLights.products}
      />

      <FeaturedRow
        title="Pendants & Drops"
        categorySlug="hanging-pendant"
        products={pendants.products}
      />

      {/* Closing Band */}
      <section className="bg-night-900 border-y border-line py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-text-hi mb-4">
            Lighting consultations for homes and projects
          </h2>
          <p className="text-text-mid text-base mb-8">
            Our lighting experts are ready to help you design the perfect space.
          </p>
          <Link
            href="mailto:support@celestiallights.in"
            className={`${buttonClasses('outline', 'md')} inline-block focus-visible:ring-2 focus-visible:ring-ember-500 focus-visible:outline-none`}
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
