"use client";

export function CapacityBar({
  current,
  capacity,
}: {
  current: number;
  capacity: number;
}) {
  const pct = capacity > 0 ? Math.min((current / capacity) * 100, 100) : 0;
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-gold" : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-sand-dark rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-warmGrey">
        {current}/{capacity}
      </span>
    </div>
  );
}
