"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-navy font-bold text-xl">PKH</span>
        </div>
        <h1 className="text-2xl font-bold text-navy mb-3">Something went wrong</h1>
        <p className="text-warm-grey mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-navy hover:bg-navy-light text-white font-medium rounded-md transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
