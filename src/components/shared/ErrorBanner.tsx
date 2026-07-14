'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function ErrorBanner({ message = 'Something went wrong', onRetry, dismissible, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#FF5A6E]/10 border border-[#FF5A6E]/20">
      <AlertTriangle className="h-5 w-5 text-[#FF5A6E] shrink-0" />
      <p className="text-[13px] text-[#FF5A6E] font-medium flex-1">{message}</p>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white bg-[#FF5A6E]/20 hover:bg-[#FF5A6E]/30 active:scale-95 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        )}
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="text-white/40 hover:text-white/70 text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
