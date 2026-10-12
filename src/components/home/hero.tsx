import Link from 'next/link';
import Image from 'next/image';
import type { CatalogueImage } from '@/lib/types';

interface HeroProps {
  image: CatalogueImage | null;
  href: string;
}

/**
 * Split hero: copy panel left, image panel right. No text over the photo.
 * Editorial image treatment is object-cover. A missing image stays an empty well.
 */
export function Hero({ image, href }: HeroProps) {
  return (
    <section className="grid grid-cols-1 border-b border-line md:grid-cols-2">
      <div className="order-2 flex flex-col justify-center bg-paper gutter py-14 md:order-1 md:py-24">
        <h1 className="caps text-display-xl text-ink">
          Light,
          <br />
          Made Objects
        </h1>

        <p className="mt-5 max-w-[42ch] text-body-lg text-ink-mid">
          Crystal chandeliers, pendants, lamps and wall lights. Price and
          finish are confirmed on WhatsApp.
        </p>

        <div>
          <Link href={href} className="rule-link mt-7 text-ink">
            See the range
          </Link>
        </div>
      </div>

      <div className="relative order-1 min-h-[340px] bg-well md:order-2 md:min-h-[620px]">
        {image && (
          <Image
            src={image.src}
            alt={image.alt || 'Celestial Lights'}
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
