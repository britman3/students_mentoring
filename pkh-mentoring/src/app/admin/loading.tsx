export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-sand animate-pulse rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
            <div className="h-4 w-20 bg-sand animate-pulse rounded mb-3" />
            <div className="h-8 w-12 bg-sand animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm p-6">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-sand animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
