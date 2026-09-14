import { Skeleton } from "@/components/ui/skeleton";

export function RoomCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-white/10 bg-white/5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          <Skeleton className="w-7 h-7 rounded-full border-2 border-darkblue" />
          <Skeleton className="w-7 h-7 rounded-full border-2 border-darkblue" />
          <Skeleton className="w-7 h-7 rounded-full border-2 border-darkblue" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function RoomGallerySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <RoomCardSkeleton key={i} />
      ))}
    </div>
  );
}
