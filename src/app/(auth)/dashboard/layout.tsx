import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | DocuExtract',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
