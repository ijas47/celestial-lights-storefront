import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

export function Footer() {
  return (
    <footer className="border-t border-line bg-night-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="font-display text-lg font-bold text-text-hi mb-4">Celestial Lights</div>
            <p className="text-sm text-text-mid">Premium designer lighting across India.</p>
          </div>

          {/* Categories - Split into columns */}
          {[0, 1, 2].map((colIndex) => (
            <div key={colIndex} className="col-span-1">
              <nav className="space-y-3">
                {CATEGORIES.slice(colIndex * 4, (colIndex + 1) * 4).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/collections/${cat.slug}`}
                    className="text-sm text-text-mid hover:text-text-hi transition-colors block"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="border-t border-line pt-8">
          <p className="text-xs text-text-low">
            © {new Date().getFullYear()} Celestial Lights. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
