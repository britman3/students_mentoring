export default function HeroBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="bg-navy py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
        <h1 className="font-heading text-3xl font-extrabold text-white md:text-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
