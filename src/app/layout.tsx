import type { Metadata } from 'next';
import { Archivo } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/cart/cart-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { SearchDialog } from '@/components/search/search-dialog';
import { baseUrl, jsonLdScriptProps, organizationJsonLd } from '@/lib/seo';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
      className={`${archivo.variable} h-full antialiased`}
    >
      <head>
        <script {...jsonLdScriptProps(orgJsonLd)} />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
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
