import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeroBanner from "@/components/sections/HeroBanner";
import LeadForm from "@/components/sections/LeadForm";
import CTAPanel from "@/components/sections/CTAPanel";

// Placeholder: in production this would query the locations database table
async function getLocation(slug: string) {
  // Return null for now — no location data exists yet.
  // This will trigger the 404 page as expected.
  void slug;
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ location: string }>;
}): Promise<Metadata> {
  const { location } = await params;
  const data = await getLocation(location);
  if (!data) return { title: "Not Found" };
  return {
    title: `Sell Your House Fast in ${location} | A Very Fast Sale`,
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ location: string }>;
}) {
  const { location } = await params;
  const data = await getLocation(location);
  if (!data) notFound();

  // Template for when location data exists
  return (
    <>
      <HeroBanner title={`Sell Your House Fast in ${location}`} />

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <p className="leading-relaxed text-ink">
                Location content will be loaded from the database.
              </p>
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
