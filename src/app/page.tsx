import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import SituationTiles from "@/components/sections/SituationTiles";
import HowItWorks from "@/components/sections/HowItWorks";
import Testimonials from "@/components/sections/Testimonials";
import FAQAccordion from "@/components/sections/FAQAccordion";
import CTAPanel from "@/components/sections/CTAPanel";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <SituationTiles />
      <HowItWorks />
      <Testimonials />
      <FAQAccordion />
      <CTAPanel />
    </>
  );
}
