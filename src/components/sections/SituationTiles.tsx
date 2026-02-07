import Link from "next/link";

const situations = [
  {
    emoji: "📜",
    title: "Probate / Inherited",
    description: "Sell an inherited property quickly without the stress.",
    href: "/situations/probate",
  },
  {
    emoji: "💔",
    title: "Divorce / Separation",
    description: "Move forward with a fast, clean property sale.",
    href: "/situations/divorce",
  },
  {
    emoji: "🏦",
    title: "Mortgage Arrears",
    description: "Avoid repossession with a quick cash sale.",
    href: "/situations/arrears",
  },
  {
    emoji: "🔑",
    title: "Tenant Problems",
    description: "Sell your rental property with tenants in situ.",
    href: "/situations/tenants",
  },
  {
    emoji: "✈️",
    title: "Relocating",
    description: "Need to move fast? Sell your home on your timeline.",
    href: "/situations/relocating",
  },
  {
    emoji: "🏡",
    title: "Downsizing",
    description: "Downsize without the hassle of the open market.",
    href: "/situations/downsizing",
  },
];

export default function SituationTiles() {
  return (
    <section className="bg-warm-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-center font-heading text-2xl font-bold text-navy md:text-3xl">
          Whatever Your Situation, We Can Help
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {situations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="text-3xl">{item.emoji}</span>
              <h3 className="mt-3 font-heading text-lg font-bold text-navy">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-grey">{item.description}</p>
              <span className="mt-3 inline-block font-heading text-sm font-semibold text-green transition-colors group-hover:text-green-dark">
                Learn more &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
