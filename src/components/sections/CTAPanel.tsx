import Link from "next/link";

export default function CTAPanel() {
  return (
    <section className="bg-warm-white py-16 md:py-20">
      <div className="mx-auto max-w-3xl rounded-2xl border-l-4 border-green bg-white px-6 py-10 text-center shadow-sm md:px-12">
        <h2 className="font-heading text-2xl font-bold text-navy md:text-3xl">
          Ready to Get Your Free Cash Offer?
        </h2>
        <p className="mt-3 text-grey">
          No obligation. No fees. Just a fair offer.
        </p>
        <Link
          href="/get-offer"
          className="mt-6 inline-block rounded-xl bg-green px-8 py-3 font-heading text-base font-bold text-white transition-colors hover:bg-green-dark"
        >
          Get My Offer &rarr;
        </Link>
      </div>
    </section>
  );
}
