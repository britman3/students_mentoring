"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-error text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">Something went wrong</h2>
        <p className="text-warm-grey mb-6 text-sm">
          {error.message || "An error occurred while loading this page."}
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
