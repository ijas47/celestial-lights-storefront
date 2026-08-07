import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function Footer() {
  return (
    <footer className="border-t border-line bg-night-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <div className="font-display text-lg font-bold text-text-hi mb-3">
              Celestial Lights
            </div>
            <p className="text-sm text-text-mid mb-4">
              Premium designer lighting for homes that glow.
            </p>
            <a
              href="mailto:support@celestiallights.in"
              className="text-sm text-text-mid hover:text-ember-300 transition-colors"
            >
              support@celestiallights.in
            </a>
          </div>

          {/* Shop Column */}
          <div>
            <h3 className="font-display text-sm font-bold text-text-hi mb-4">Shop</h3>
            <nav className="space-y-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/collections/${cat.slug}`}
                  className="text-sm text-text-mid hover:text-ember-300 transition-colors block"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Spacer for lg screens */}
          <div className="hidden lg:block" />
        </div>

        {/* Copyright */}
        <div className="border-t border-line pt-8">
          <p className="text-xs text-text-low">
            © 2026 Celestial Lights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
