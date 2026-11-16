import { getByCategory } from '@/lib/catalogue';
import { HOMEPAGE_BLOCKS } from '@/lib/homepage';
import Link from 'next/link';
import { enquiryUrl, EMAIL } from '@/lib/enquiry';
import { Hero } from '@/components/home/hero';
import { CollectionBlocks } from '@/components/home/collection-blocks';
import { CategoryTiles } from '@/components/home/category-tiles';
import { FeaturedRow } from '@/components/home/featured-row';
import type { CatalogueImage, Product } from '@/lib/types';

function roomImage(products: Product[]): CatalogueImage | null {
  const product = products.find((item) => item.images.length > 0);
  return product?.images[0] ?? null;
}

export default function Home() {
  const chandeliers = getByCategory('chandeliers');
  const pendants = getByCategory('hanging-pendant');
  const wallLights = getByCategory('wall-lights');
  const heroProducts = chandeliers.length > 0 ? chandeliers : pendants;
  const heroHref =
    chandeliers.length > 0 ? '/collections/chandeliers' : '/collections/hanging-pendant';

  return (
    <>
      <Hero image={roomImage(heroProducts)} href={heroHref} />

      <CollectionBlocks
        blocks={HOMEPAGE_BLOCKS.map((block) => ({
          slug: block.slug,
          name: block.name,
          blurb: block.blurb,
          image: roomImage(getByCategory(block.slug)),
        }))}
      />

      <FeaturedRow
        title="Signature Chandeliers"
        categorySlug="chandeliers"
        products={chandeliers}
        preloadFirst
      />

      <FeaturedRow
        title="Wall Lights"
        categorySlug="wall-lights"
        products={wallLights}
      />

      <CategoryTiles />

      <section className="bg-band gutter section">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="caps text-label text-ink-inverse">The range</h3>
            <p className="mt-3 max-w-[32ch] text-body-sm text-ink-inverse-mid">
              Chandeliers, pendants, lamps and wall lights are listed on this site.
            </p>
          </div>
          <div>
            <h3 className="caps text-label text-ink-inverse">Price and finish</h3>
            <p className="mt-3 max-w-[32ch] text-body-sm text-ink-inverse-mid">
              Price, finish and lead time are confirmed by contact or on WhatsApp.
            </p>
          </div>
          <div>
            <h3 className="caps text-label text-ink-inverse">Showrooms</h3>
            <p className="mt-3 max-w-[36ch] text-body-sm text-ink-inverse-mid">
              Celestial Lights Kannur and Celestial Lights Calicut.{' '}
              <Link
                href="/contact"
                className="text-ink-inverse underline underline-offset-4"
              >
                Contact
              </Link>
              {' · '}
              <a
                href={enquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-inverse underline underline-offset-4"
              >
                WhatsApp
              </a>
              {' · '}
              <a
                href={`mailto:${EMAIL}`}
                className="text-ink-inverse underline underline-offset-4"
              >
                {EMAIL}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
