import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  preloadImage?: boolean;
}

export function ProductCard({ product, preloadImage }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="well relative aspect-square border border-line">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt || product.title}
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
      </div>

      <h3 className="caps-tight mt-4 line-clamp-2 min-h-[2.7em] text-product text-ink">
        {product.title}
      </h3>
      <p className="mt-1.5 text-label-sm text-ink-mid">{product.model}</p>
    </Link>
  );
}
