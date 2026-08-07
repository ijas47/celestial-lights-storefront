import Link from 'next/link';
import { buttonClasses } from '@/components/ui/button';

export function Hero() {
  return (
    <section className="hero-aurora min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full text-center flex flex-col items-center animate-fade-up">
        {/* Eyebrow */}
        <p className="text-ember-300 text-sm tracking-[0.2em] uppercase mb-6">
          Celestial Lights
        </p>

        {/* Main Heading */}
        <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-glow mb-6">
          Light your home like the night sky
        </h1>

        {/* Supporting Line */}
        <p className="text-text-mid text-lg max-w-xl mb-10">
          Chandeliers, pendants and warm architectural light — 800+ designer fixtures, shipped across India.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/collections/chandeliers"
            className={`${buttonClasses('ember', 'md')} rounded-full px-6 py-3 text-base focus-visible:ring-2 focus-visible:ring-ember-500`}
          >
            Shop Chandeliers
          </Link>
          <Link
            href="#categories"
            className={`${buttonClasses('ghost', 'md')} focus-visible:ring-2 focus-visible:ring-ember-500`}
          >
            Browse all categories
          </Link>
        </div>
      </div>
    </section>
  );
}
