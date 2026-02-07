"use client";

export default function LeadForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Lead form submitted (placeholder)");
  };

  return (
    <div className="rounded-2xl bg-light-grey p-6 md:p-8">
      <h3 className="font-heading text-xl font-bold text-navy">
        Get Your Free Cash Offer
      </h3>
      <p className="mt-1 text-sm text-grey">
        No obligation &middot; No fees &middot; Takes 60 seconds
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Full name"
            className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
          />
          <input
            type="tel"
            placeholder="Phone number"
            className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
          />
        </div>
        <input
          type="email"
          placeholder="Email address"
          className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Address line 1"
            className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
          />
          <input
            type="text"
            placeholder="Address line 2"
            className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Town / City"
            className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
          />
          <input
            type="text"
            placeholder="Postcode"
            className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Approx. property value"
            className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-navy outline-none transition-colors focus:border-green"
          />
          <select className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-grey outline-none transition-colors focus:border-green">
            <option value="">Reason for sale</option>
            <option value="probate">Probate / Inherited</option>
            <option value="divorce">Divorce / Separation</option>
            <option value="arrears">Mortgage Arrears</option>
            <option value="tenants">Tenant Problems</option>
            <option value="relocating">Relocating</option>
            <option value="downsizing">Downsizing</option>
            <option value="other">Other</option>
          </select>
        </div>
        <select className="rounded-xl border border-border-grey bg-white px-4 py-3 font-heading text-sm text-grey outline-none transition-colors focus:border-green">
          <option value="">How quickly do you want to sell?</option>
          <option value="asap">As soon as possible</option>
          <option value="1month">Within 1 month</option>
          <option value="3months">Within 3 months</option>
          <option value="flexible">Flexible</option>
        </select>

        <label className="flex items-start gap-2 text-sm text-grey">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border-grey text-green accent-green"
          />
          <span>
            I consent to A Very Fast Sale contacting me about my property. See
            our{" "}
            <a href="/privacy" className="text-green underline">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-green px-6 py-3 font-heading text-base font-bold text-white transition-colors hover:bg-green-dark"
        >
          Get My Free Offer &rarr;
        </button>
      </form>
    </div>
  );
}
