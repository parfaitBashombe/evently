import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="flex flex-col rounded-xl ring-1 ring-border overflow-hidden"
      >
        {/* Body */}
        <div className="flex flex-col gap-2 p-4 pr-12">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-1 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
