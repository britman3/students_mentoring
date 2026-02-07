import type { Metadata } from "next";
import HeroBanner from "@/components/sections/HeroBanner";

export const metadata: Metadata = {
  title: "Cookie Policy | A Very Fast Sale",
  description: "How A Very Fast Sale uses cookies on our website.",
};

export default function CookiesPage() {
  return (
    <>
      <HeroBanner title="Cookie Policy" />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                What are cookies?
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                Cookies are small text files that are placed on your device when
                you visit a website. They are widely used to make websites work
                more efficiently and to provide information to the site owners.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                What cookies we use
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                We currently use only essential cookies that are necessary for
                the website to function properly:
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-border-grey">
                      <th className="px-4 py-3 font-heading font-bold text-navy">
                        Cookie
                      </th>
                      <th className="px-4 py-3 font-heading font-bold text-navy">
                        Purpose
                      </th>
                      <th className="px-4 py-3 font-heading font-bold text-navy">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-grey">
                      <td className="px-4 py-3 font-mono text-ink">cookie_consent</td>
                      <td className="px-4 py-3 text-ink">
                        Records whether you have accepted our cookie notice
                      </td>
                      <td className="px-4 py-3 text-ink">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                How to manage cookies
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                You can control and delete cookies through your browser settings.
                Most browsers allow you to block or delete cookies. However,
                blocking essential cookies may affect how the website functions.
              </p>
              <p className="mt-2 leading-relaxed text-ink">
                For more information about managing cookies, visit your
                browser&apos;s help pages.
              </p>
            </div>

            <div>
              <h2 className="font-heading text-xl font-bold text-navy">
                Changes to this policy
              </h2>
              <p className="mt-3 leading-relaxed text-ink">
                We may update this cookie policy as we add new features to the
                website. Any changes will be posted on this page.
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
