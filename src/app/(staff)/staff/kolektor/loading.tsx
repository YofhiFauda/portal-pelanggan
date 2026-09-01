export default function StaffKolektorLoading() {
  return (
    <div className="space-y-6">
      {/* Customer Profile Card Skeleton */}
      <div className="flex items-center gap-4 rounded-xl border border-border/50 bg-surface-muted/30 p-4">
        <div className="skeleton h-12 w-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-3.5 w-24" />
        </div>
      </div>

      {/* Invoice List Title & Cards Skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-3.5 w-32" />
        <div className="skeleton h-20 rounded-xl" />
        <div className="skeleton h-20 rounded-xl" />
      </div>

      {/* Payment Method Selector Skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-3.5 w-28" />
        <div className="grid grid-cols-2 gap-2.5">
          <div className="skeleton h-14 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
        </div>
      </div>

      {/* Submit Button Skeleton */}
      <div className="skeleton h-12 rounded-xl mt-4" />
    </div>
  );
}

