import Link from 'next/link';
import Image from 'next/image';
import type { ShopImage } from '@/lib/types';

interface HeroProps {
  image: ShopImage | null;
  href: string;
}

/**
 * Split hero: copy panel left, image panel right. Deliberately NOT an
 * overlay — the catalog mixes cutout product shots with dark lifestyle
 * photography, and text over an unpredictable image is unreadable.
 *
 * Editorial image treatment: object-cover, no multiply blend. The source
 * image is curated in lib/homepage.ts, not taken from sort order.
 */
export function Hero({ image, href }: HeroProps) {
  return (
    <section className="grid grid-cols-1 border-b border-line md:grid-cols-2">
      <div className="order-2 flex flex-col justify-center bg-paper gutter py-14 md:order-1 md:py-24">
        <p className="caps text-label-sm text-ink-mid">Celestial Lights</p>

        <h1 className="caps mt-5 text-display-xl text-ink">
          Light,
          <br />
          Made Objects
        </h1>

        <p className="mt-5 max-w-[40ch] text-body-lg text-ink-mid">
          Eight hundred and thirty designer luminaires — sculpted in crystal,
          marble, glass and brass. Made for the Indian home.
        </p>

        <div>
          <Link href={href} className="rule-link mt-7 text-ink">
            Shop lighting
          </Link>
        </div>
      </div>

      <div className="relative order-1 min-h-[340px] bg-well md:order-2 md:min-h-[620px]">
        {image && (
          <Image
            src={image.url}
            alt={image.altText || 'Celestial Lights'}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            preload
            className="object-cover"
          />
        )}
      </div>
    </section>
  );
}
