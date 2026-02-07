import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";
import LeadForm from "@/components/sections/LeadForm";

export const metadata: Metadata = {
  title: "Contact | A Very Fast Sale",
  description:
    "Get in touch with A Very Fast Sale. Call us, email us, or fill in our form for a free cash offer.",
};

export default function ContactPage() {
  return (
    <>
      <HeroBanner title="Get in Touch" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Contact info */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy">
                Contact Information
              </h2>
              <p className="mt-4 leading-relaxed text-ink">
                Whether you have a question about selling your property or you
                are ready to get started, we are here to help.
              </p>

              <div className="mt-8 flex flex-col gap-6">
                <div>
                  <h3 className="font-heading text-sm font-bold text-navy">
                    Phone
                  </h3>
                  <p className="mt-1 text-ink">0800 XXX XXXX</p>
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-navy">
                    Email
                  </h3>
                  <p className="mt-1 text-ink">hello@averyfastsale.com</p>
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-navy">
                    Hours
                  </h3>
                  <p className="mt-1 text-ink">Monday to Friday, 9am-6pm</p>
                </div>
              </div>
            </div>

            {/* Lead form */}
            <LeadForm />
          </div>
        </div>
      </section>
    </>
  );
}
