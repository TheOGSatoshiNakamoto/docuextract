import type { Metadata } from 'next';
import { Space_Grotesk, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'DocuExtract — Send a document, get JSON back',
  description:
    'DocuExtract converts invoices, receipts, contracts, and any document into clean, structured JSON via a single API call. No templates. No training. Works in 5 minutes.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'DocuExtract — Send a document, get JSON back',
    description: 'Zero-config document extraction API. Powered by Claude AI. Free tier available.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
