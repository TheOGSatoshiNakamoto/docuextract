'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Dashboard error boundary. Catches render errors in any child component
 * and shows a recovery UI instead of white-screening the entire app.
 *
 * Place this:
 * 1. Around the entire dashboard content (in DashboardLayout)
 * 2. Around individual high-risk sections (charts, tables, panels)
 */
export default class DashboardErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Dashboard Error Boundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 max-w-lg mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-2xl text-error">warning</span>
          </div>
          <h2 className="font-headline font-bold text-xl text-on-surface mb-2">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className="text-sm text-on-surface-variant mb-1">
            An unexpected error occurred while rendering this page.
          </p>
          {this.state.error && (
            <p className="text-xs text-on-surface-variant/40 font-mono mb-6 max-w-md break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-5 py-2.5 bg-primary-container text-white rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition-all"
            >
              Try Again
            </button>
            <a
              href="/dashboard"
              className="px-5 py-2.5 border border-outline-variant/20 text-on-surface rounded-lg font-headline font-bold text-xs uppercase tracking-[0.15em] hover:bg-surface-container-high transition-colors"
            >
              Go to Overview
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
