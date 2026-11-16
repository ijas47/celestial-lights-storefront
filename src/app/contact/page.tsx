import type { Metadata } from 'next';
import { CALL_DISPLAY, EMAIL, WHATSAPP_DISPLAY, contactUrl, enquiryUrl } from '@/lib/enquiry';
import { buttonClasses } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact Celestial Lights to purchase a fitting. Kannur and Calicut showrooms, phone, email and WhatsApp.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl gutter section">
      <h1 className="caps text-display-lg text-ink">Contact to purchase</h1>
      <p className="mt-5 max-w-[48ch] text-body-lg text-ink-mid">
        This site is a catalogue. Ask for the price, finish and lead time, and the showroom will reply.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <a href={contactUrl()} className={buttonClasses('solid', 'md')}>
          Email the showroom
        </a>
        <a
          href={enquiryUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses('outline', 'md')}
        >
          WhatsApp
        </a>
      </div>

      <dl className="mt-14 max-w-xl border-t border-line">
        <div className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4">
          <dt className="text-label-sm text-ink-mid">Email</dt>
          <dd className="text-body-sm text-ink">
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </dd>
        </div>
        <div className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4">
          <dt className="text-label-sm text-ink-mid">Phone</dt>
          <dd className="text-body-sm text-ink">
            <a href="tel:+919995619470">{CALL_DISPLAY}</a>
          </dd>
        </div>
        <div className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4">
          <dt className="text-label-sm text-ink-mid">WhatsApp</dt>
          <dd className="text-body-sm text-ink">
            <a href={enquiryUrl()} target="_blank" rel="noopener noreferrer">
              {WHATSAPP_DISPLAY}
            </a>
          </dd>
        </div>
        <div className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-line py-4">
          <dt className="text-label-sm text-ink-mid">Showrooms</dt>
          <dd className="text-body-sm text-ink">
            Celestial Lights Kannur
            <br />
            Celestial Lights Calicut
          </dd>
        </div>
      </dl>
    </div>
  );
}
