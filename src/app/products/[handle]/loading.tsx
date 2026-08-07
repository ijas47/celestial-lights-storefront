import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingProductPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
      {/* Main grid */}
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Left: Gallery skeleton */}
        <div className="space-y-3">
          <Skeleton className="aspect-square" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-16" />
            <Skeleton className="w-16 h-16" />
            <Skeleton className="w-16 h-16" />
            <Skeleton className="w-16 h-16" />
          </div>
        </div>

        {/* Right: Product info skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <div className="flex flex-wrap gap-2 py-4">
            <Skeleton className="h-10 w-20 rounded-pill" />
            <Skeleton className="h-10 w-20 rounded-pill" />
            <Skeleton className="h-10 w-20 rounded-pill" />
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="border-t border-line mt-8 pt-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
