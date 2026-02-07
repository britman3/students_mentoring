import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";

export const metadata: Metadata = {
  title: "Privacy Policy | A Very Fast Sale",
  description: "How A Very Fast Sale collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <>
      <HeroBanner title="Privacy Policy" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="prose-navy flex flex-col gap-8">
            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Who we are
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                A Very Fast Sale is a property buying company operating across
                England and Wales. We are the data controller for the personal
                information we collect through our website and services.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                What data we collect
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                When you use our website or contact us, we may collect the
                following personal data:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-ink">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Property address and postcode</li>
                <li>Approximate property value</li>
                <li>Reason for selling and preferred timeline</li>
                <li>Any additional information you provide in correspondence</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Why we collect your data
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                We use your personal data for the following purposes:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-ink">
                <li>To provide you with a cash offer on your property</li>
                <li>To contact you about your enquiry</li>
                <li>To progress a property purchase if you accept our offer</li>
                <li>To send you relevant communications (with your consent)</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                How we store your data
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                Your data is stored securely using industry-standard encryption.
                We use trusted third-party service providers including Resend for
                email communications. All data is stored within the UK or EEA
                and is protected by appropriate technical and organisational
                measures.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Who we share your data with
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                We may share your data with:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-ink">
                <li>Solicitors and conveyancers involved in a property transaction</li>
                <li>Surveyors instructed to value your property</li>
                <li>Email service providers (Resend) for communications</li>
                <li>Law enforcement or regulatory bodies where required by law</li>
              </ul>
              <p className="mt-2 leading-relaxed text-ink">
                We will never sell your personal data to third parties.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Data retention
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                We retain your personal data for as long as necessary to fulfil
                the purposes for which it was collected. Enquiry data is retained
                for up to 24 months after your last interaction with us.
                Transaction data is retained for 6 years to comply with legal
                and regulatory requirements.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Your rights
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                Under UK GDPR, you have the right to:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-ink">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p className="mt-2 leading-relaxed text-ink">
                To exercise any of these rights, contact us at
                hello@averyfastsale.com. If you are not satisfied with our
                response, you have the right to complain to the Information
                Commissioner&apos;s Office (ICO) at ico.org.uk.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Changes to this policy
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                We may update this privacy policy from time to time. Any changes
                will be posted on this page with an updated effective date.
              </p>
              <p className="mt-2 text-sm text-grey">
                Last updated: February 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
