import Link from 'next/link';
import Image from 'next/image';
import type { ShopImage } from '@/lib/types';

export interface CollectionBlock {
  slug: string;
  name: string;
  blurb: string;
  image: ShopImage | null;
}

interface CollectionBlocksProps {
  blocks: CollectionBlock[];
}

/**
 * Two-up editorial blocks — the signature layout gesture of this system.
 * Editorial image treatment (object-cover, no blend); alternating well tones
 * keep the pair from reading as one flat band.
 */
export function CollectionBlocks({ blocks }: CollectionBlocksProps) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {blocks.map((block, i) => (
        <article key={block.slug}>
          <Link href={`/collections/${block.slug}`} className="block">
            <div
              className={`relative h-[380px] md:h-[440px] ${
                i % 2 === 1 ? 'bg-well-alt' : 'bg-well'
              }`}
            >
              {block.image && (
                <Image
                  src={block.image.url}
                  alt={block.image.altText || block.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
          </Link>
          <div className="gutter pb-14 pt-6">
            <h2 className="caps text-display-md text-ink">{block.name}</h2>
            <p className="mt-3 max-w-[46ch] text-body text-ink-mid">
              {block.blurb}
            </p>
            <Link
              href={`/collections/${block.slug}`}
              className="rule-link mt-4 text-ink"
            >
              Shop {block.name}
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
