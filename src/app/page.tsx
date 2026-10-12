import { getByCategory } from '@/lib/catalogue';
import { HOMEPAGE_BLOCKS } from '@/lib/homepage';
import { enquiryUrl, EMAIL } from '@/lib/enquiry';
import { Hero } from '@/components/home/hero';
import { CollectionBlocks } from '@/components/home/collection-blocks';
import { CategoryTiles } from '@/components/home/category-tiles';
import { FeaturedRow } from '@/components/home/featured-row';
import type { CatalogueImage, Product } from '@/lib/types';

function roomImage(products: Product[]): CatalogueImage | null {
  const product = products.find((item) => item.images.length > 1);
  return product?.images[1] ?? null;
}

export default function Home() {
  const chandeliers = getByCategory('chandeliers');
  const wallLights = getByCategory('wall-lights');

  return (
    <>
      <Hero image={roomImage(chandeliers)} href="/collections/chandeliers" />

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
              Price, available finishes and lead time are confirmed on WhatsApp.
            </p>
          </div>
          <div>
            <h3 className="caps text-label text-ink-inverse">Showrooms</h3>
            <p className="mt-3 max-w-[36ch] text-body-sm text-ink-inverse-mid">
              Celestial Lights Kannur and Celestial Lights Calicut.{' '}
              <a
                href={enquiryUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-inverse underline underline-offset-4"
              >
                Get in touch
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
