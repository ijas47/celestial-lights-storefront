import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryLoading() {
  return (
    <>
      {/* Page header skeleton */}
      <div className="border-b border-line">
        <div className="max-w-7xl mx-auto gutter pt-12 pb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-4 h-4 w-full max-w-[52ch]" />
          <Skeleton className="mt-2 h-4 w-3/4 max-w-[52ch]" />
          <div className="mt-6 flex items-center justify-between gap-4">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto gutter py-8">
        <div className="grid-products">
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
