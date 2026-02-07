import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";
import CTAPanel from "@/components/sections/CTAPanel";

export const metadata: Metadata = {
  title: "About | A Very Fast Sale",
  description:
    "Learn about A Very Fast Sale and our mission to help homeowners sell quickly and fairly.",
};

const values = [
  {
    title: "Honesty",
    description: "We tell you exactly what we can offer and why. No inflated promises, no bait-and-switch tactics.",
  },
  {
    title: "Speed",
    description: "We move quickly because we know time matters. Most offers are delivered within 24 to 48 hours.",
  },
  {
    title: "Fairness",
    description: "Our offers are based on real market data. We aim to give you the best price for a fast, certain sale.",
  },
  {
    title: "No Pressure",
    description: "Every offer is no-obligation. We will never pressure you to accept or rush your decision.",
  },
];

export default function AboutPage() {
  return (
    <>
      <HeroBanner title="About A Very Fast Sale" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <h2 className="font-heading text-2xl font-bold text-navy">
            Our Story
          </h2>
          <p className="mt-4 leading-relaxed text-ink">
            A Very Fast Sale was created to give homeowners a genuine, no-nonsense
            route to selling their property quickly. We understand that life throws
            curveballs — whether it is probate, divorce, financial difficulty, or
            simply wanting a fresh start — and sometimes you need a fast, certain
            sale without the stress of estate agents, chains, and months of
            waiting.
          </p>

          <h2 className="mt-12 font-heading text-2xl font-bold text-navy">
            Our Mission
          </h2>
          <p className="mt-4 leading-relaxed text-ink">
            Our mission is simple: make fair cash offers, move quickly, and treat
            every seller with respect and transparency.
          </p>

          <h2 className="mt-12 font-heading text-2xl font-bold text-navy">
            Our Values
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border-grey bg-white p-5"
              >
                <h3 className="font-heading text-lg font-bold text-navy">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-grey">
                  {v.description}
                </p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 font-heading text-2xl font-bold text-navy">
            Our Team
          </h2>
          <div className="mt-6 rounded-2xl border border-border-grey bg-light-grey p-8 text-center">
            <p className="text-sm text-grey">
              Team profiles coming soon.
            </p>
          </div>
        </div>
      </section>

      <CTAPanel />
    </>
  );
}
