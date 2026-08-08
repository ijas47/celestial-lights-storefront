import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl gutter section-tight">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="text-label text-ink mb-3">
              Celestial Lights
            </div>
            <p className="text-body text-ink-mid mb-4">
              Premium designer lighting for homes that glow.
            </p>
            <a
              href="mailto:support@celestiallights.in"
              className="text-label text-ink-mid hover:text-ink transition-colors"
            >
              support@celestiallights.in
            </a>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="text-label text-ink mb-4">Shop</h3>
            <nav className="space-y-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="text-label text-ink-mid hover:text-ink transition-colors block"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Spacer for lg screens */}
          <div className="hidden lg:block" />
        </div>

        {/* Bottom row */}
        <div className="border-t border-line pt-8 flex flex-wrap items-center justify-between gap-2">
          <p className="text-label-sm text-ink-mid">
            © 2026 Celestial Lights
          </p>
          <a
            href="mailto:support@celestiallights.in"
            className="text-label-sm text-ink-mid hover:text-ink transition-colors"
          >
            support@celestiallights.in
          </a>
        </div>
      </div>
    </footer>
  );
}
