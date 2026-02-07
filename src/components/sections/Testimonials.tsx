interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

const defaultTestimonials: Testimonial[] = [
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
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className="h-5 w-5 text-amber"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials({
  testimonials = defaultTestimonials,
}: {
  testimonials?: Testimonial[];
}) {
  return (
    <section className="bg-warm-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-navy md:text-3xl">
          What Our Sellers Say
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl bg-white p-6 shadow-sm md:p-8"
            >
              <Stars />
              <blockquote className="mt-4 text-sm leading-relaxed text-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <p className="mt-4 font-heading text-sm font-bold text-navy">
                {t.name}
              </p>
              <p className="text-xs text-grey">{t.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
