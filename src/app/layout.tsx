import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DocuExtract — Send a document, get JSON back',
  description:
    'DocuExtract converts invoices, receipts, contracts, and any document into clean, structured JSON via a single API call. No templates. No training. Works in 5 minutes.',
  openGraph: {
    title: 'DocuExtract — Send a document, get JSON back',
    description: 'Zero-config document extraction API. Powered by Claude AI. Free tier available.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
