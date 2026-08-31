import { SkeletonRows } from '@/components/SkeletonRows';

/**
 * Loading UI Next.js App Router — otomatis dipasang Suspense boundary di
 * sekitar tiap halaman `(portal)/*` selagi Server Component-nya nge-fetch
 * data ke Laravel. Sebelumnya gak ada — user liat blank sampai RSC selesai.
 * `SkeletonRows` (sebelumnya gak dipakai di mana pun) sekarang punya guna.
 */
export default function PortalLoading() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="skeleton h-8 w-48" />
      <SkeletonRows count={4} />
    </div>
  );
}
