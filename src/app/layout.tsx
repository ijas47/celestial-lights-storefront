import type { Metadata } from 'next';
import { Geist, Geist_Mono, Fraunces } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/cart/cart-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { SearchDialog } from '@/components/search/search-dialog';
import { baseUrl, jsonLdScriptProps, organizationJsonLd } from '@/lib/seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  axes: ['opsz'],
});

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: 'Celestial Lights — Premium Designer Lighting',
    template: '%s | Celestial Lights',
  },
  description:
    'Premium chandeliers, wall lights, pendants and outdoor lighting. Designer fixtures with warm, atmospheric light — shipped across India.',
  openGraph: {
    siteName: 'Celestial Lights',
    type: 'website',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const orgJsonLd = organizationJsonLd();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        <script {...jsonLdScriptProps(orgJsonLd)} />
      </head>
      <body className="min-h-full flex flex-col bg-night-950 text-text-hi">
        <CartProvider>
          <Header />
          <main className="min-h-screen flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <SearchDialog />
        </CartProvider>
      </body>
    </html>
  );
}
