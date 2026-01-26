import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonProjects() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Tree Structure */}
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-2 pl-4">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
