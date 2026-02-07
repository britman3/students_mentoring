"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: "How quickly can you buy my house?",
    answer:
      "We can complete a purchase in as little as 7 days, although most sales complete within 2 to 4 weeks. You choose the timeline that works best for you.",
  },
  {
    question: "Are there any fees or commissions?",
    answer:
      "No. There are no fees, no commissions, and no hidden charges. We cover our own legal costs and there is no obligation at any stage.",
  },
  {
    question: "How do you calculate your offer?",
    answer:
      "We base our offers on current market data, recent comparable sales, and the condition of the property. We aim to offer a fair price that reflects the speed and certainty of a cash sale.",
  },
  {
    question: "Do I need to make repairs before selling?",
    answer:
      "No. We buy properties in any condition. There is no need to redecorate, repair, or even clean the property before selling to us.",
  },
  {
    question: "Is your offer guaranteed?",
    answer:
      "Our initial offer is subject to a survey and basic due diligence, which we carry out at our own cost. In most cases, the final offer matches the initial figure.",
  },
  {
    question: "Can you buy any type of property?",
    answer:
      "We buy houses, flats, bungalows, commercial properties, land, and properties with sitting tenants. If you are unsure whether we can help, get in touch and we will let you know.",
  },
  {
    question: "Do you buy properties with sitting tenants?",
    answer:
      "Yes. We regularly buy properties with tenants in situ. The tenants can remain in the property after the sale if needed.",
  },
  {
    question: "What areas do you cover?",
    answer:
      "We buy properties across England and Wales. Whether you are in a city centre or a rural area, we can help.",
  },
  {
    question: "Am I obligated to accept your offer?",
    answer:
      "Absolutely not. Our offers are completely no-obligation. If you decide not to proceed, that is perfectly fine.",
  },
  {
    question: "How is this different from an estate agent?",
    answer:
      "Estate agents list your property on the open market and wait for a buyer. We are the buyer. That means no viewings, no chains, no fall-throughs, and no waiting months for a sale.",
  },
  {
    question: "Will you value my property for free?",
    answer:
      "Yes. We provide a free, no-obligation valuation and cash offer on every property.",
  },
  {
    question: "Can I stay in the property after selling?",
    answer:
      "In many cases, yes. We can discuss rent-back arrangements or flexible completion dates to suit your needs.",
  },
];

export default function FAQAccordion({ items = defaultFAQs }: { items?: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-navy md:text-3xl">
          Frequently Asked Questions
        </h2>

        <div className="mt-10 flex flex-col gap-2">
          {items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-border-grey bg-white"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-heading text-sm font-bold text-navy md:text-base">
                    {item.question}
                  </span>
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-grey transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-96 pb-4" : "max-h-0"
                  }`}
                >
                  <p className="px-5 text-sm leading-relaxed text-ink">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
