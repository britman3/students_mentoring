export default function StudentsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 bg-sand animate-pulse rounded" />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 flex-1 bg-sand animate-pulse rounded" />
        <div className="h-10 w-32 bg-sand animate-pulse rounded" />
        <div className="h-10 w-32 bg-sand animate-pulse rounded" />
        <div className="h-10 w-32 bg-sand animate-pulse rounded" />
      </div>
      <div className="bg-white rounded-lg border border-sand-dark shadow-sm">
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-12 bg-sand animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
