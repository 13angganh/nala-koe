'use client';

import React from 'react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('ErrorBoundary caught error', { error, componentStack: info.componentStack });
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--error-subtle)] bg-[var(--error-subtle)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--error)]">
            Komponen ini mengalami kesalahan.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-sm text-[var(--text-secondary)] underline"
          >
            Coba lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
