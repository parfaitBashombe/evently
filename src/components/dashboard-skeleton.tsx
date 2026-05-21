export const DashboardSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex flex-col rounded-2xl border border-white/8 bg-[#0e1528] overflow-hidden">
        <div className="flex flex-col gap-2.5 p-5 pr-12">
          <div className="h-4 w-24 rounded-full bg-white/6 animate-pulse" />
          <div className="h-5 w-3/5 rounded-lg bg-white/6 animate-pulse" />
          <div className="h-3 w-2/5 rounded-full bg-white/4 animate-pulse" />
        </div>
        <div className="flex items-center justify-between border-t border-white/6 px-5 py-3">
          <div className="flex gap-1.5">
            <div className="h-5 w-12 rounded-full bg-white/6 animate-pulse" />
            <div className="h-5 w-12 rounded-full bg-white/6 animate-pulse" />
            <div className="h-5 w-12 rounded-full bg-white/6 animate-pulse" />
          </div>
          <div className="h-1.5 w-16 rounded-full bg-white/6 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);
