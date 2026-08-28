import Link from 'next/link';
import type { PaginatedData } from '@/lib/types/portal-api';

/**
 * Satu komponen paginasi buat semua list (tagihan/pembayaran/saldo-mutasi/
 * tiket). Baca `meta` dari Laravel Resource apa adanya, JANGAN hitung ulang
 * total halaman manual.
 *
 * Halaman-halaman di app ini Server Component yang baca `?page=` dari URL
 * (bukan client state) — jadi navigasinya lewat <Link>, bukan onClick
 * callback: query berubah → Next.js re-render Server Component dengan data
 * baru, SSR tetap kepegang (gak perlu client-side fetch tambahan).
 */
export function Pagination({
  meta,
  basePath,
  searchParams,
}: {
  meta: PaginatedData<unknown>['meta'];
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  const { current_page, last_page } = meta;
  if (!last_page || last_page <= 1) return null;

  function hrefFor(page: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set('page', String(page));
    return `${basePath}?${params.toString()}`;
  }

  const prevDisabled = current_page <= 1;
  const nextDisabled = current_page >= last_page;

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 pt-3">
      <Link
        href={hrefFor(current_page - 1)}
        aria-disabled={prevDisabled}
        className={`rounded-md px-3 py-1.5 text-sm ${
          prevDisabled
            ? 'pointer-events-none text-gray-300'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        &larr; Sebelumnya
      </Link>
      <span className="text-sm text-gray-500">
        Halaman {current_page} dari {last_page}
      </span>
      <Link
        href={hrefFor(current_page + 1)}
        aria-disabled={nextDisabled}
        className={`rounded-md px-3 py-1.5 text-sm ${
          nextDisabled
            ? 'pointer-events-none text-gray-300'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Selanjutnya &rarr;
      </Link>
    </nav>
  );
}
