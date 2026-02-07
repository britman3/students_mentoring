import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeroBanner from "@/components/sections/HeroBanner";
import TrustBar from "@/components/sections/TrustBar";
import LeadForm from "@/components/sections/LeadForm";
import FAQAccordion from "@/components/sections/FAQAccordion";
import CTAPanel from "@/components/sections/CTAPanel";

interface SituationData {
  title: string;
  heading: string;
  paragraphs: string[];
  faqs: { question: string; answer: string }[];
}

const situations: Record<string, SituationData> = {
  probate: {
    title: "Sell Your Probate Property Fast",
    heading: "Sell Your Probate Property Fast",
    paragraphs: [
      "Dealing with probate is stressful enough without worrying about selling a property. We specialise in buying probate properties quickly and can work directly with your solicitor to make the process as smooth as possible. There is no need to clear, clean, or repair the property — we buy as-is.",
      "Whether the grant of probate has been issued or you are still waiting, we can begin the process and have everything ready to complete as soon as the legal paperwork is in place.",
      "Our team understands the sensitivity of these situations and will handle everything with care and discretion.",
    ],
    faqs: [
      { question: "Can you buy before probate is granted?", answer: "We can agree a price and prepare all the legal work before probate is granted. Completion takes place once the grant is issued." },
      { question: "Do I need to clear the property first?", answer: "No. We buy properties in any condition and can handle clearance if needed." },
      { question: "How long does a probate sale take?", answer: "Once probate is granted, we can typically complete within 7 to 28 days." },
    ],
  },
  divorce: {
    title: "Sell Your Property During Divorce",
    heading: "Sell Your Property During Divorce",
    paragraphs: [
      "Divorce and separation are difficult enough without the added stress of selling a shared property. We offer a fast, discreet way to sell so both parties can move forward.",
      "We can work with both parties and their solicitors to ensure a smooth process. There are no viewings, no chain, and no uncertainty — just a fair cash offer and a completion date that works for everyone.",
      "Whether you need to sell quickly to settle finances or simply want to move on, we can help.",
    ],
    faqs: [
      { question: "Do both parties need to agree to the sale?", answer: "Yes, all legal owners of the property need to agree to the sale. We can work with both parties and their solicitors." },
      { question: "Can you help if we need to sell urgently?", answer: "Yes. We can complete in as little as 7 days if both parties are ready to proceed." },
      { question: "Is the process confidential?", answer: "Absolutely. We handle all enquiries with complete discretion." },
    ],
  },
  arrears: {
    title: "Sell Your Property to Avoid Repossession",
    heading: "Sell Your Property to Avoid Repossession",
    paragraphs: [
      "Falling behind on mortgage payments is stressful and frightening. If you are facing repossession, selling your property quickly for cash can help you clear your mortgage and avoid the damage to your credit record.",
      "We can move fast — often completing within 7 to 14 days — which can be enough to stop repossession proceedings. We work directly with your lender and solicitor to make sure everything is handled properly.",
      "There is no judgement and no pressure. We are here to help you find a way forward.",
    ],
    faqs: [
      { question: "Can you complete before my repossession date?", answer: "In most cases, yes. We can complete in as little as 7 days. Contact us as soon as possible so we can act quickly." },
      { question: "Will the sale cover my mortgage?", answer: "Our offer will be based on the property's market value. In most cases, the sale proceeds will cover the outstanding mortgage." },
      { question: "Will this affect my credit score?", answer: "A voluntary sale is far less damaging to your credit record than a repossession. Selling before repossession proceedings conclude can help protect your credit." },
    ],
  },
  tenants: {
    title: "Sell Your Rental Property with Tenants",
    heading: "Sell Your Rental Property with Tenants",
    paragraphs: [
      "Selling a property with tenants in situ can be complicated on the open market. Many buyers do not want to take on existing tenants, and the process of eviction is long and costly.",
      "We regularly buy properties with sitting tenants. The tenants can remain in the property after the sale, meaning no disruption for anyone. There are no viewings and no need to serve notice.",
      "Whether you have reliable long-term tenants or are dealing with problem tenants, we can help you sell quickly and move on.",
    ],
    faqs: [
      { question: "Do the tenants need to leave?", answer: "No. We buy with tenants in situ. They can remain in the property after the sale." },
      { question: "What if my tenants are not paying rent?", answer: "We can still buy the property. Non-paying tenants do not prevent us from making an offer." },
      { question: "Will there be viewings?", answer: "No. We do not require internal viewings for most properties, so there is no disruption to your tenants." },
    ],
  },
  inherited: {
    title: "Sell Your Inherited Property Fast",
    heading: "Sell Your Inherited Property Fast",
    paragraphs: [
      "Inheriting a property can bring unexpected responsibilities — maintenance, council tax, insurance, and the stress of selling from a distance. We make it simple.",
      "We buy inherited properties in any condition, anywhere in England and Wales. There is no need to renovate, clear, or prepare the property. We handle everything.",
      "Our team will work with your solicitor to ensure the sale is straightforward and stress-free.",
    ],
    faqs: [
      { question: "Do I need to clear the property before selling?", answer: "No. We buy properties as-is, including any contents." },
      { question: "What if the property needs work?", answer: "We buy in any condition. Structural issues, damp, outdated interiors — none of these are a problem." },
      { question: "Can you buy if I live far from the property?", answer: "Yes. Many of our sellers live far from the inherited property. We handle everything remotely." },
    ],
  },
  relocating: {
    title: "Sell Your House Fast When Relocating",
    heading: "Sell Your House Fast When Relocating",
    paragraphs: [
      "Whether you are relocating for work, family, or a fresh start, selling your home quickly can make the transition much easier. Waiting months for a buyer on the open market is not always practical when you need to move now.",
      "We offer cash purchases that can complete in as little as 7 days, giving you the certainty and speed you need to focus on your move.",
      "There are no viewings to arrange, no chain to worry about, and no risk of the sale falling through at the last minute.",
    ],
    faqs: [
      { question: "How fast can you complete?", answer: "We can complete in as little as 7 days, or on a timeline that suits your relocation schedule." },
      { question: "Can I choose the completion date?", answer: "Yes. You choose the completion date that works best for your move." },
      { question: "Do I need to be in the UK to sell?", answer: "No. We can handle the entire process remotely if you have already relocated." },
    ],
  },
  downsizing: {
    title: "Sell Your Home When Downsizing",
    heading: "Sell Your Home When Downsizing",
    paragraphs: [
      "Downsizing should be an exciting new chapter, not a stressful ordeal. If you want to avoid the hassle of estate agents, endless viewings, and months of uncertainty, a cash sale could be the right option for you.",
      "We buy properties of all sizes and can complete on a timeline that suits you. Whether you need a few weeks to find your new home or you are ready to go, we will work around you.",
      "There are no fees, no commissions, and no pressure. Just a fair offer and a smooth process.",
    ],
    faqs: [
      { question: "Can I stay in the property while I find somewhere new?", answer: "Yes. We can agree a flexible completion date or even a rent-back arrangement so you can stay while you search." },
      { question: "Do I need to redecorate or repair anything?", answer: "No. We buy properties in any condition." },
      { question: "Is there any obligation to accept your offer?", answer: "None at all. Our offers are completely no-obligation." },
    ],
  },
};

export async function generateStaticParams() {
  return Object.keys(situations).map((situation) => ({ situation }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ situation: string }>;
}): Promise<Metadata> {
  const { situation } = await params;
  const data = situations[situation];
  if (!data) return { title: "Not Found" };
  return {
    title: `${data.title} | A Very Fast Sale`,
    description: data.paragraphs[0],
  };
}

export default async function SituationPage({
  params,
}: {
  params: Promise<{ situation: string }>;
}) {
  const { situation } = await params;
  const data = situations[situation];
  if (!data) notFound();

  return (
    <>
      <HeroBanner title={data.heading} />
      <TrustBar />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {data.paragraphs.map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-ink first:mt-0">
                  {p}
                </p>
              ))}

              <div className="mt-12">
                <FAQAccordion items={data.faqs} />
              </div>
            </div>

            <div className="lg:col-span-2">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>

      <CTAPanel />
    </>
  );
}
