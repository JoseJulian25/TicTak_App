import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonSettings() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-white dark:bg-gray-800 rounded-xl border">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
