import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl gutter section">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="caps text-label font-bold tracking-[0.18em] text-ink">
              Celestial Lights
            </div>
            <p className="mt-4 max-w-[34ch] text-body text-ink-mid">
              Premium designer lighting for homes that glow. Eight hundred and
              thirty fixtures, shipped across India.
            </p>
            <a
              href="mailto:support@celestiallights.in"
              className="rule-link mt-6 text-ink"
            >
              support@celestiallights.in
            </a>
          </div>

          {/* Shop — the full index, two columns so it fills the width
              instead of leaving a void beside a single thin list. */}
          <div className="lg:col-span-8">
            <h3 className="caps mb-5 text-label text-ink">Shop</h3>
            <nav className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="text-body-sm text-ink-mid transition-colors hover:text-ink"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-8">
          <p className="caps text-label-sm text-ink-low">
            © 2026 Celestial Lights
          </p>
          <p className="caps text-label-sm text-ink-low">Ships across India</p>
        </div>
      </div>
    </footer>
  );
}
