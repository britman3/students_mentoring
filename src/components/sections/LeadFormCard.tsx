"use client";

export default function LeadFormCard() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lead form submitted (placeholder)");
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">
      <h3 className="font-heading text-xl font-bold text-navy">
        Get Your Free Offer
      </h3>
      <p className="mt-1 text-sm text-grey">
        No obligation. Takes 60 seconds.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
        <input
          type="text"
          placeholder="Your postcode"
          className="rounded-xl border border-border-grey px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
        />
        <input
          type="email"
          placeholder="Email address"
          className="rounded-xl border border-border-grey px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
        />
        <input
          type="tel"
          placeholder="Phone number"
          className="rounded-xl border border-border-grey px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
        />
        <button
          type="submit"
          className="mt-2 rounded-xl bg-green px-6 py-3 font-heading text-sm font-bold text-white transition-colors hover:bg-green-dark"
        >
          Get My Free Offer &rarr;
        </button>
      </form>
    </div>
  );
}
