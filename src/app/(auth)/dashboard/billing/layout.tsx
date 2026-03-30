import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing | DocuExtract',
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
