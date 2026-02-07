import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-light px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
        <h2 className="text-xl font-semibold text-navy mb-2">Page Not Found</h2>
        <p className="text-warmGrey mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-navy text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-navy-light transition-colors"
        >
          Back to Home
        </Link>
        <p className="text-xs text-stone mt-8">PKH Mentoring Programme</p>
      </div>
    </div>
  );
}
