import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center bg-navy px-4 py-24 text-center">
      <h1 className="font-heading text-4xl font-extrabold text-white md:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-lg text-white/70">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-green px-8 py-3 font-heading text-base font-bold text-white transition-colors hover:bg-green-dark"
      >
        Go to homepage
      </Link>
    </section>
  );
}
