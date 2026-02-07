const badges = [
  {
    icon: (
      <svg className="h-5 w-5 text-amber" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    text: "24-48 Hour Offer",
    bg: "bg-amber-light",
    textColor: "text-navy",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    text: "No Fees or Commissions",
    bg: "bg-green-light",
    textColor: "text-navy",
  },
  {
    icon: (
      <svg className="h-5 w-5 text-navy" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
    text: "Cash Buyer — No Chain",
    bg: "bg-light-grey",
    textColor: "text-navy",
  },
];

export default function TrustBar() {
  return (
    <section className="bg-light-grey py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 sm:flex-row sm:gap-8 md:px-8">
        {badges.map((badge) => (
          <div
            key={badge.text}
            className={`flex items-center gap-2 rounded-full ${badge.bg} px-5 py-2.5`}
          >
            {badge.icon}
            <span className={`font-heading text-sm font-semibold ${badge.textColor}`}>
              {badge.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
