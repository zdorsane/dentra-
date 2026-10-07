'use client';

import { useEffect } from 'react';

import { ErrorState } from '@/components/ui/States';

/**
 * Route-level error boundary. Next.js renders this when a page throws during
 * render, so a single broken screen never takes the whole app down.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this is where a reporter (Sentry et al.) would be called.
    console.error('DENTRA route error:', error);
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#F2F1F0] px-5">
      <div className="w-full max-w-[480px] border border-[rgba(43,48,51,0.12)] bg-white">
        <ErrorState
          title="SOMETHING WENT WRONG"
          description="Unable to load clinic data."
          detail={error.digest ? `Reference: ${error.digest}` : error.message}
          onRetry={reset}
        />
      </div>
    </main>
  );
}
