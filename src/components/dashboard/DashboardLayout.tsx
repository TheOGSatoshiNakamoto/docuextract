'use client';

import Sidebar from './Sidebar';
import TopBar from './TopBar';
import DashboardErrorBoundary from './ErrorBoundary';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-surface text-on-surface">
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <DashboardErrorBoundary>{children}</DashboardErrorBoundary>
        </main>
        <footer className="border-t border-outline-variant/10 py-4 px-8 flex justify-between items-center text-[10px] font-headline uppercase tracking-[0.15em] text-on-surface-variant/30">
          <div>&copy; 2026 DocuExtract</div>
          <div className="flex gap-6">
            {/* TODO: Re-add status page link when BetterUptime/Statuspage is configured */}
            <a className="hover:text-primary transition-colors" href="/terms">Terms</a>
            <a className="hover:text-primary transition-colors" href="/privacy">Privacy</a>
            <a className="hover:text-primary transition-colors" href="/acceptable-use">Acceptable Use</a>
            <a className="hover:text-primary transition-colors" href="/security">Security</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
