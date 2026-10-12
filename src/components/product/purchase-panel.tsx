import type { Product } from '@/lib/types';
import { enquiryUrl } from '@/lib/enquiry';
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
      <p className="text-body text-ink">Price on request</p>
      <a
        href={enquiryUrl(product)}
        target="_blank"
        rel="noopener noreferrer"
        className={`${buttonClasses('solid', 'md')} w-full`}
      >
        Enquire on WhatsApp
      </a>
    </div>
  );
}
