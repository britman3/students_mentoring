import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";

export const metadata: Metadata = {
  title: "Terms and Conditions | A Very Fast Sale",
  description: "Terms and conditions for using the A Very Fast Sale website and services.",
};

export default function TermsPage() {
  return (
    <>
      <HeroBanner title="Terms and Conditions" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Introduction
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                These terms and conditions govern your use of the A Very Fast
                Sale website and our property buying services. By using this
                website, you accept these terms in full.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Our service
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                A Very Fast Sale provides cash offers on residential and
                commercial properties across England and Wales. We act as a
                principal buyer or may connect sellers with third-party buyers
                within our network. In all cases, the terms of any sale will be
                clearly communicated before you enter into any agreement.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Offers and valuations
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                All offers provided through this website or by our team are
                subject to survey, due diligence, and verification of property
                details. An initial offer is an indication of price and is not
                legally binding until contracts are exchanged. We do not
                guarantee any specific price or timeline for completion.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                No guarantees
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                While we endeavour to provide accurate information and fair
                offers, we make no guarantees regarding:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-ink">
                <li>The final offer price (which may change following survey)</li>
                <li>The timeline for completion</li>
                <li>The availability of our services for any particular property</li>
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Limitation of liability
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                To the fullest extent permitted by law, A Very Fast Sale shall
                not be liable for any indirect, incidental, special, or
                consequential damages arising from your use of this website or
                our services. Our total liability shall not exceed the value of
                any transaction between us.
              </p>
              <p className="mt-2 leading-relaxed text-ink">
                Nothing in these terms excludes or limits liability for death or
                personal injury caused by negligence, fraud, or any other
                liability that cannot be excluded by law.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Intellectual property
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                All content on this website, including text, images, logos, and
                design, is the property of A Very Fast Sale and is protected by
                copyright. You may not reproduce, distribute, or use any content
                without our written permission.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Governing law
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                These terms are governed by the laws of England and Wales. Any
                disputes shall be subject to the exclusive jurisdiction of the
                courts of England and Wales.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Changes to these terms
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                We may revise these terms at any time. Continued use of the
                website after changes constitutes acceptance of the updated
                terms.
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
