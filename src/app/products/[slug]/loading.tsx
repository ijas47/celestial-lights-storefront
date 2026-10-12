import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingProductPage() {
  return (
    <div className="mx-auto max-w-7xl gutter py-10">
      <div className="grid items-start gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square" />

        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-3 w-32" />
          <div className="space-y-3 border-t border-line pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
