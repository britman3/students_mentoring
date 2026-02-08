export default function SlotsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-sand animate-pulse rounded" />
        <div className="h-10 w-28 bg-sand animate-pulse rounded" />
      </div>
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-sand animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
