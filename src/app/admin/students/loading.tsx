import { TableSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <div>
      <div className="skeleton h-8 w-32 mb-2" />
      <div className="skeleton h-4 w-48 mb-8" />
      <TableSkeleton rows={8} />
    </div>
  );
}
