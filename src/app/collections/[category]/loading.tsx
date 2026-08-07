import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryLoading() {
  return (
    <>
      {/* Hero Banner Skeleton */}
      <div className="border-b border-line hero-aurora">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 flex items-center justify-between gap-4 mb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
