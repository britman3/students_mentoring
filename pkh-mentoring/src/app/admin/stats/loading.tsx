export default function StatsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-36 bg-sand animate-pulse rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
            <div className="h-4 w-24 bg-sand animate-pulse rounded mb-3" />
            <div className="h-8 w-16 bg-sand animate-pulse rounded mb-2" />
            <div className="h-3 w-full bg-sand animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-sand animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
