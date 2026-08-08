import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { SearchTrigger } from '@/components/search/search-dialog';
import { CartButton } from '@/components/cart/cart-button';
import { MobileNav } from './mobile-nav';

/**
 * Six primary categories only. All ten overflow the bar and wrap.
 * The full index lives on the homepage and in the mobile sheet.
 */
const PRIMARY_NAV = CATEGORIES.slice(0, 6);

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-6">
          <MobileNav />

          <Link
            href="/"
            className="whitespace-nowrap text-label font-bold tracking-[0.18em] text-ink"
          >
            Celestial Lights
          </Link>

          <nav className="hidden flex-1 justify-center gap-6 lg:flex xl:gap-8">
            {PRIMARY_NAV.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="text-label whitespace-nowrap text-ink transition-opacity hover:opacity-55"
              >
                {cat.shortName || cat.name}
              </Link>
            ))}
            <Link
              href="/#categories"
              className="text-label whitespace-nowrap text-ink-mid transition-opacity hover:opacity-55"
            >
              All
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-5">
            <SearchTrigger />
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}
