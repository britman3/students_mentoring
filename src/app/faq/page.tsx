import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";
import FAQAccordion from "@/components/sections/FAQAccordion";
import CTAPanel from "@/components/sections/CTAPanel";

export const metadata: Metadata = {
  title: "FAQ | A Very Fast Sale",
  description:
    "Frequently asked questions about selling your house fast with A Very Fast Sale.",
};

const fullFAQs = [
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
  {
    question: "What happens after I accept the offer?",
    answer:
      "Once you accept, we instruct solicitors to handle the legal work. We keep you updated throughout and you choose the completion date.",
  },
  {
    question: "Do I need a solicitor?",
    answer:
      "Yes, you will need a solicitor or conveyancer to handle your side of the legal work. If you do not have one, we can recommend one. Their fees are typically modest for a cash sale.",
  },
  {
    question: "Will I get the full market value for my property?",
    answer:
      "Our offers reflect the speed, certainty, and convenience of a cash sale. While our offers may be below full market value, you save on estate agent fees, avoid months of waiting, and have certainty that the sale will complete.",
  },
];

export default function FAQPage() {
  return (
    <>
      <HeroBanner title="Frequently Asked Questions" />
      <FAQAccordion items={fullFAQs} />
      <CTAPanel />
    </>
  );
}
