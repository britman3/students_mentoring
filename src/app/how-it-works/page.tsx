import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";
import CTAPanel from "@/components/sections/CTAPanel";

export const metadata: Metadata = {
  title: "How It Works | A Very Fast Sale",
  description:
    "Sell your house in 3 simple steps. Get a cash offer in 24-48 hours and complete on your timeline.",
};

const steps = [
  {
    number: "01",
    title: "Tell Us About Your Property",
    text: "Start by filling in a few details about your property. We need the address, a rough idea of the value, and how quickly you'd like to sell. The whole thing takes less than a minute. There is no obligation.",
    bg: "bg-green",
  },
  {
    number: "02",
    title: "Receive a Cash Offer",
    text: "Our team will review your property details and come back to you with a fair cash offer, usually within 24 to 48 hours. We are genuine cash buyers so there is no chain and no risk of the sale falling through.",
    bg: "bg-amber",
  },
  {
    number: "03",
    title: "Complete on Your Timeline",
    text: "If you are happy with the offer, we instruct solicitors and handle the legal work. You choose the completion date. Some sellers complete in as little as 7 days. Others prefer 4 to 6 weeks. It is entirely up to you.",
    bg: "bg-navy",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <HeroBanner title="How It Works" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="flex flex-col gap-12">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex flex-shrink-0 flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${step.bg}`}
                  >
                    <span className="font-heading text-lg font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <div className="mt-2 h-full w-px bg-border-grey" />
                </div>
                <div className="pb-4">
                  <h2 className="font-heading text-xl font-bold text-navy">
                    {step.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-ink">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTAPanel />
    </>
  );
}
