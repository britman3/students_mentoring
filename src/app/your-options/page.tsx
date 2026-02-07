import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";
import CTAPanel from "@/components/sections/CTAPanel";

export const metadata: Metadata = {
  title: "Your Options for Selling | A Very Fast Sale",
  description:
    "Compare your selling options: cash sale, assisted sale, or auction. Find the best route for your situation.",
};

const options = [
  {
    title: "Cash Sale",
    description:
      "We buy your property direct with cash. This is the fastest route with no fees, no viewings, and no chain. Completion can happen in as little as 7 days.",
    speed: "7-28 days",
    fees: "None",
    certainty: "Very high",
    control: "You choose completion date",
    accent: "border-green",
  },
  {
    title: "Assisted Sale",
    description:
      "We help you sell on the open market with our support and guidance. This may take longer but could achieve a higher price.",
    speed: "3-6 months",
    fees: "Agent fees apply",
    certainty: "Moderate",
    control: "Dependent on buyer",
    accent: "border-amber",
  },
  {
    title: "Auction",
    description:
      "If your property suits the auction route, we can help you prepare and list it. Auction sales typically complete within 28 days of the hammer falling.",
    speed: "6-10 weeks",
    fees: "Auction fees apply",
    certainty: "Moderate-high",
    control: "Fixed 28-day completion",
    accent: "border-navy",
  },
];

const comparisonRows = [
  { label: "Speed", key: "speed" as const },
  { label: "Fees", key: "fees" as const },
  { label: "Certainty", key: "certainty" as const },
  { label: "Your control", key: "control" as const },
];

export default function YourOptionsPage() {
  return (
    <>
      <HeroBanner title="Your Options for Selling" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {options.map((opt) => (
              <div
                key={opt.title}
                className={`rounded-2xl border-t-4 ${opt.accent} bg-white p-6 shadow-sm md:p-8`}
              >
                <h2 className="font-heading text-xl font-bold text-navy">
                  {opt.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink">
                  {opt.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <h2 className="mb-8 text-center font-heading text-2xl font-bold text-navy">
              Compare Your Options
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-border-grey">
                    <th className="px-4 py-3 font-heading text-sm font-bold text-navy" />
                    {options.map((opt) => (
                      <th
                        key={opt.title}
                        className="px-4 py-3 font-heading text-sm font-bold text-navy"
                      >
                        {opt.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-border-grey"
                    >
                      <td className="px-4 py-3 font-heading text-sm font-semibold text-navy">
                        {row.label}
                      </td>
                      {options.map((opt) => (
                        <td
                          key={opt.title}
                          className="px-4 py-3 text-sm text-ink"
                        >
                          {opt[row.key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <CTAPanel />
    </>
  );
}
