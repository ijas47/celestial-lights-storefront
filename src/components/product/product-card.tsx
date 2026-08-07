import Link from 'next/link';
import Image from 'next/image';
import type { ProductCardData } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Price } from './price';

interface ProductCardProps {
  product: ProductCardData;
  preloadImage?: boolean;
}

export function ProductCard({ product, preloadImage }: ProductCardProps) {
  const { handle, title, availableForSale, featuredImage, priceRange, compareAtPriceRange } = product;

  return (
    <Link href={`/products/${handle}`}>
      <div className="glow-card rounded-card overflow-hidden bg-night-800 transition-transform group">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-night-800">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText || title}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              preload={preloadImage}
              className="object-cover group-hover:scale-104 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-low">
              ✦
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="line-clamp-2 text-text-hi font-medium text-sm mb-3 min-h-[2.6em]">
            {title}
          </h3>

          {/* Price */}
          <div className="mb-3">
            <Price
              amount={priceRange.minVariantPrice.amount}
              compareAtAmount={compareAtPriceRange.minVariantPrice.amount}
              currencyCode={priceRange.minVariantPrice.currencyCode}
              size="sm"
            />
          </div>

          {/* Status Badge */}
          {!availableForSale && (
            <Badge tone="danger">Sold out</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
