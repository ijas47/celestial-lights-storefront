import type { Product } from '@/lib/types';
import { contactUrl, enquiryUrl } from '@/lib/enquiry';
import { buttonClasses } from '@/components/ui/button';
import { SpecList } from './variant-picker';

interface PurchasePanelProps {
  product: Product;
}

export function PurchasePanel({ product }: PurchasePanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="caps text-display-lg text-ink">{product.title}</h1>
        <p className="mt-3 text-label-sm text-ink-mid">{product.model}</p>
      </div>
      <SpecList specs={product.specs} />
      <p className="text-body text-ink">
        {product.specs.find((spec) => spec.label === 'MRP')?.value ?? 'Price on request'}
      </p>
      <div className="flex flex-col gap-3">
        <a href={contactUrl(product)} className={`${buttonClasses('solid', 'md')} w-full`}>
          Contact to purchase
        </a>
        <a
          href={enquiryUrl(product)}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonClasses('outline', 'md')} w-full`}
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
