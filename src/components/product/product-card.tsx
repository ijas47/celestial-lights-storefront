import Link from 'next/link';
import Image from 'next/image';
import type { ProductCardData } from '@/lib/types';
import { Price } from './price';

interface ProductCardProps {
  product: ProductCardData;
  preloadImage?: boolean;
}

export function ProductCard({ product, preloadImage }: ProductCardProps) {
  const {
    handle,
    title,
    availableForSale,
    featuredImage,
    priceRange,
    compareAtPriceRange,
  } = product;

  return (
    <Link href={`/products/${handle}`} className="group block">
      {/* Catalog image treatment: full-bleed object-contain in a square well.
          The hairline border keeps white-background product shots defined
          against the white page. */}
      <div className="well relative aspect-square border border-line">
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.altText || title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            preload={preloadImage}
            className="object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="caps text-label-sm text-ink-low">No image</span>
          </div>
        )}
        {!availableForSale && (
          <span className="caps absolute left-4 top-4 bg-paper px-2 py-1 text-label-sm text-ink-mid">
            Sold out
          </span>
        )}
      </div>

      <h3 className="caps-tight mt-4 line-clamp-2 min-h-[2.7em] text-product text-ink">
        {title}
      </h3>

      <div className="mt-1.5">
        <Price
          amount={priceRange.minVariantPrice.amount}
          compareAtAmount={compareAtPriceRange.minVariantPrice.amount}
          currencyCode={priceRange.minVariantPrice.currencyCode}
          size="sm"
        />
      </div>
    </Link>
  );
}
