/**
 * Skeleton loading — blok abu-abu placeholder bentuk baris, BUKAN spinner
 * polos, biar layout gak "lompat" pas data masuk.
 */
export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-14" />
      ))}
    </div>
  );
}
