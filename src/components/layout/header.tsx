import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night-900/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          {/* Logo */}
          <Link href="/" className="font-display text-xl font-bold text-text-hi">
            Celestial Lights
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex gap-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className="text-sm text-text-mid hover:text-text-hi transition-colors"
              >
                {cat.shortName || cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <SearchTrigger />
            <CartButton />
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchTrigger() {
  return (
    <button className="p-2 hover:bg-night-800 rounded-lg transition-colors" aria-label="Search">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
}

function CartButton() {
  return (
    <button className="p-2 hover:bg-night-800 rounded-lg transition-colors relative" aria-label="Cart">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    </button>
  );
}
