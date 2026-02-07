"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-gold mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-navy mb-2">Something went wrong</h2>
        <p className="text-warmGrey mb-6">
          An error occurred loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-navy text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-navy-light transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
