import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Heading Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
