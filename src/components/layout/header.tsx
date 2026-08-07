import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { SearchTrigger } from '@/components/search/search-dialog';
import { CartButton } from '@/components/cart/cart-button';
import { MobileNav } from './mobile-nav';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night-900/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Nav Trigger */}
          <MobileNav />

          {/* Logo */}
          <Link href="/" className="font-display text-lg tracking-wide text-text-hi">
            Celestial Lights
          </Link>

          {/* Navigation (Desktop Only) */}
          <nav className="hidden lg:flex gap-8 flex-1 ml-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="text-sm text-text-mid hover:text-ember-300 transition-colors"
              >
                {cat.shortName || cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 ml-auto">
            <SearchTrigger />
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
