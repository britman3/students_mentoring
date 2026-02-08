import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-navy font-bold text-xl">PKH</span>
        </div>
        <h1 className="text-3xl font-bold text-navy mb-3">Page not found</h1>
        <p className="text-warm-grey mb-8">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-navy hover:bg-navy-light text-white font-medium rounded-md transition-colors text-sm"
          >
            Go Home
          </Link>
          <Link
            href="/admin"
            className="px-6 py-2.5 bg-gold hover:bg-gold-dark text-white font-medium rounded-md transition-colors text-sm"
          >
            Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
