import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
