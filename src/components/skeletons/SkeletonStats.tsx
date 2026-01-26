import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonStats() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-xl border">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="w-full h-64" />
      </div>
    </div>
  );
}
