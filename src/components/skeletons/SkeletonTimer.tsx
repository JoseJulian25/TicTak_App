import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTimer() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col items-center">
        {/* Project Tree Selector Skeleton */}
        <div className="w-full max-w-md mb-8">
          <Skeleton className="w-full h-[70px] rounded-md" />
        </div>

        {/* Circular Timer Skeleton - con animación especial */}
        <div className="my-6 md:my-8 relative">
          <Skeleton className="w-64 h-64 md:w-80 md:h-80 rounded-full" />
          {/* Centro del timer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-32 h-20 md:w-40 md:h-24" />
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="w-full max-w-md mb-8 md:pl-20">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <Skeleton className="flex-1 h-12 rounded-md" />
            <Skeleton className="flex-1 h-12 rounded-md" />
            <Skeleton className="sm:w-12 h-12 rounded-md" />
          </div>
        </div>

        {/* Message Skeleton */}
        <div className="text-center mb-8 px-4 space-y-2">
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>

        {/* Session Summary Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-7 w-40" />
        </div>

        {/* Session History Skeleton */}
        <div className="w-full max-w-4xl mt-12 px-4 md:px-0">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 py-2">
                  <Skeleton className="w-1 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
