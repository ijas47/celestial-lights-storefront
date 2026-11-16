import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { CALL_DISPLAY, EMAIL, enquiryUrl } from '@/lib/enquiry';

const SHOWROOM_LINE =
  'Seen in our Kannur and Calicut showrooms. Purchase by contact or WhatsApp.';

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl gutter section">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="caps text-label font-bold tracking-[0.18em] text-ink">
              Celestial Lights
            </div>
            <p className="mt-4 max-w-[34ch] text-body text-ink-mid">
              {SHOWROOM_LINE}
            </p>
            <Link href="/contact" className="rule-link mt-6 text-ink">
              Contact to purchase
            </Link>
            <a href={`mailto:${EMAIL}`} className="mt-4 block text-body-sm text-ink-mid">
              {EMAIL}
            </a>
            <p className="mt-3 text-label-sm text-ink-low">Call {CALL_DISPLAY}</p>
            <a
              href={enquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-label-sm text-ink"
            >
              WhatsApp
            </a>
          </div>

          <div className="lg:col-span-8">
            <h3 className="caps mb-5 text-label text-ink">Range</h3>
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

        <div className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-8">
          <p className="caps text-label-sm text-ink-low">© 2026 Celestial Lights</p>
          <p className="caps text-label-sm text-ink-low">{SHOWROOM_LINE}</p>
        </div>
      </div>
    </footer>
  );
}
