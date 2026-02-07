import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";
import Testimonials from "@/components/sections/Testimonials";
import CTAPanel from "@/components/sections/CTAPanel";

export const metadata: Metadata = {
  title: "Reviews | A Very Fast Sale",
  description:
    "Read what our sellers say about their experience with A Very Fast Sale.",
};

const allTestimonials = [
  {
    quote:
      "We were in a difficult situation with our inherited property. A Very Fast Sale made the whole process painless. We had a cash offer in 24 hours and completed in 2 weeks.",
    name: "J. Thompson",
    location: "Birmingham",
  },
  {
    quote:
      "After months on the market with no interest, I contacted A Very Fast Sale. They gave us a fair offer and we moved within 3 weeks. Couldn't be happier.",
    name: "S. Patel",
    location: "Manchester",
  },
  {
    quote:
      "The team were professional from start to finish. No pressure, no hidden fees. They did exactly what they said they would.",
    name: "R. Davies",
    location: "Leeds",
  },
  {
    quote:
      "I needed to sell quickly due to a job relocation. A Very Fast Sale gave me an offer within a day and we completed in just 10 days. Incredible service.",
    name: "M. Collins",
    location: "Bristol",
  },
  {
    quote:
      "Going through a divorce and needed to sell the family home. They handled everything with sensitivity and professionalism. Would recommend to anyone in a similar situation.",
    name: "L. Hargreaves",
    location: "Sheffield",
  },
  {
    quote:
      "I was facing repossession and needed a fast sale. A Very Fast Sale stepped in, made a fair offer, and helped me clear my mortgage. I cannot thank them enough.",
    name: "D. Wilson",
    location: "Liverpool",
  },
  {
    quote:
      "Sold my rental property with tenants in situ. No hassle, no disruption to the tenants, and the money was in my account within three weeks.",
    name: "K. Osei",
    location: "Nottingham",
  },
  {
    quote:
      "We were downsizing after retirement and wanted a stress-free sale. A Very Fast Sale delivered exactly that. The whole process was smooth and transparent.",
    name: "P. Morgan",
    location: "Cardiff",
  },
];

export default function ReviewsPage() {
  return (
    <>
      <HeroBanner title="What Our Sellers Say" />
      <Testimonials testimonials={allTestimonials} />
      <CTAPanel />
    </>
  );
}
