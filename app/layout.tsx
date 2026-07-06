import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { AuthProvider } from '../src/context/AuthContext';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://leisure-map-zhso.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Leisure Map - Trova il tuo tempo libero',
  description: 'Leisure Map: scopri attività, corsi e palestre in Veneto. Outdoor, sport, natura e gusto vicino a te.',
  openGraph: {
    title: 'Leisure Map - Trova il tuo tempo libero',
    description: 'Leisure Map: scopri attività, corsi e palestre in Veneto. Outdoor, sport, natura e gusto vicino a te.',
    url: SITE_URL,
    siteName: 'Leisure Map',
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'Leisure Map',
      },
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Leisure Map - Trova il tuo tempo libero',
    description: 'Leisure Map: scopri attività, corsi e palestre in Veneto. Outdoor, sport, natura e gusto vicino a te.',
    images: [`${SITE_URL}/og-default.png`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🗺️%3C/text%3E%3C/svg%3E" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
