const steps = [
  {
    number: "01",
    title: "Tell Us About Your Property",
    description:
      "Fill in a few details — your address, rough value, and when you'd like to sell. Takes under a minute.",
    iconBg: "bg-green",
  },
  {
    number: "02",
    title: "Receive a Cash Offer",
    description:
      "We'll review your property and come back with a fair, no-obligation cash offer within 24-48 hours.",
    iconBg: "bg-amber",
  },
  {
    number: "03",
    title: "Complete on Your Timeline",
    description:
      "Accept and we handle the legal work. You choose the completion date — as fast as 7 days or whenever suits you.",
    iconBg: "bg-navy",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-navy md:text-3xl">
          How It Works
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-border-grey bg-white p-6 md:p-8"
            >
              <span className="font-heading text-5xl font-extrabold text-border-grey">
                {step.number}
              </span>
              <div
                className={`mt-4 inline-flex h-10 w-10 items-center justify-center rounded-full ${step.iconBg}`}
              >
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-grey">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
