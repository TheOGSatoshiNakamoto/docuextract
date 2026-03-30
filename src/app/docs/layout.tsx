import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation | DocuExtract',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
