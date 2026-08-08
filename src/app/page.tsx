import Link from 'next/link';
import { getCategoryProducts, getProduct } from '@/lib/shopify';
import { HERO_CANDIDATES, HOMEPAGE_BLOCKS } from '@/lib/homepage';
import { Hero } from '@/components/home/hero';
import { CollectionBlocks } from '@/components/home/collection-blocks';
import { CategoryTiles } from '@/components/home/category-tiles';
import { FeaturedRow } from '@/components/home/featured-row';

export const revalidate = 3600;

export default async function Home() {
  const [chandeliers, wallLights, pendants, heroCandidates] = await Promise.all([
    getCategoryProducts('chandeliers', { first: 8, sort: 'featured' }),
    getCategoryProducts('wall-lights', { first: 8, sort: 'featured' }),
    getCategoryProducts('hanging-pendant', { first: 8, sort: 'featured' }),
    Promise.all(HERO_CANDIDATES.map((handle) => getProduct(handle))),
  ]);

  // First curated candidate that resolves with an image wins; never blank.
  const heroImage =
    heroCandidates.find((p) => p?.featuredImage)?.featuredImage ??
    chandeliers.products[0]?.featuredImage ??
    null;

  const blockImages: Record<string, (typeof pendants)['products'][number] | undefined> = {
    'hanging-pendant': pendants.products[0],
    'wall-lights': wallLights.products[0],
  };

  return (
    <>
      <Hero image={heroImage} href="/collections/chandeliers" />

      <CollectionBlocks
        blocks={HOMEPAGE_BLOCKS.map((block) => ({
          slug: block.slug,
          name: block.name,
          blurb: block.blurb,
          image: blockImages[block.slug]?.featuredImage ?? null,
        }))}
      />

      <FeaturedRow
        title="Signature Chandeliers"
        categorySlug="chandeliers"
        products={chandeliers.products}
        preloadFirst
      />

      <FeaturedRow
        title="Wall Lights"
        categorySlug="wall-lights"
        products={wallLights.products}
      />

      <CategoryTiles />

      {/* Inverted band — the one dark surface in the system */}
      <section className="bg-band gutter section">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="caps text-label text-ink-inverse">Made to last</h3>
            <p className="mt-3 max-w-[32ch] text-body-sm text-ink-inverse-mid">
              One to two year warranty on every fixture, with in-house repair and
              spare parts held in stock.
            </p>
          </div>
          <div>
            <h3 className="caps text-label text-ink-inverse">
              Delivered nationwide
            </h3>
            <p className="mt-3 max-w-[32ch] text-body-sm text-ink-inverse-mid">
              Dispatched in 48 hours, insured against breakage, installed with
              video guidance.
            </p>
          </div>
          <div>
            <h3 className="caps text-label text-ink-inverse">
              Specified with you
            </h3>
            <p className="mt-3 max-w-[32ch] text-body-sm text-ink-inverse-mid">
              Free lighting consultation for homes, studios and architectural
              projects.{' '}
              <Link
                href="mailto:support@celestiallights.in"
                className="text-ink-inverse underline underline-offset-4"
              >
                Get in touch
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
