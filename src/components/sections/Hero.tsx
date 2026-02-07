import LeadFormCard from "./LeadFormCard";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Green radial gradient accent */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-green/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 px-4 py-16 md:flex-row md:gap-16 md:px-8 md:py-24">
        {/* Left column */}
        <div className="flex-1 text-white">
          <h1 className="font-heading text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Sell Your House in as Little as 48 Hours
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-white/80 md:text-xl">
            Get a fair cash offer on your property with no fees, no chains, and
            no obligation. We buy houses across England and Wales.
          </p>

          {/* Trust pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "No Fees",
              "No Viewings",
              "No Chains",
            ].map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-heading text-sm font-semibold text-white"
              >
                <svg className="h-4 w-4 text-amber" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Right column: form card */}
        <div className="w-full max-w-md flex-shrink-0">
          <LeadFormCard />
        </div>
      </div>
    </section>
  );
}
