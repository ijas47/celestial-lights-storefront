import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        {/* Eyebrow */}
        <p className="caps text-label text-ink-mid">404</p>

        {/* Heading */}
        <h1 className="mt-4 text-display-lg text-ink">
          Page not found
        </h1>

        {/* Message */}
        <p className="mt-4 text-ink-mid">
          This light doesn&apos;t exist — but 800 others do.
        </p>

        {/* Links */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
          <Link href="/" className="rule-link">
            Back to the showroom
          </Link>
          <Link href="/collections/chandeliers" className="rule-link">
            Shop chandeliers
          </Link>
        </div>
      </div>
    </section>
  );
}
