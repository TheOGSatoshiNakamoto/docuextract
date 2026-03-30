import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Playground | DocuExtract',
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
