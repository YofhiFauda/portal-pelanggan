import Link from 'next/link';
import { callLaravel } from '@/lib/laravel-client';
import { StatusBadge } from '@/components/StatusBadge';
import { DateDisplay } from '@/components/DateDisplay';
import { EmptyState } from '@/components/EmptyState';
import { ErrorBanner } from '@/components/ErrorBanner';
import { Pagination } from '@/components/Pagination';
import type { PaginatedData, TicketListItem } from '@/lib/types/portal-api';

/**
 * TANPA filter/query param sama sekali (beda dari tagihan/pembayaran) —
 * cuma ?page= buat paginasi. JANGAN tambah dropdown filter di sini, backend
 * gak nyediain param buat itu.
 */
export default async function TiketListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const query = params.page ? `?page=${params.page}` : '';
  const result = await callLaravel<PaginatedData<TicketListItem>>(`/me/tickets${query}`, {
    auth: true,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-gray-900">Tiket</h1>

      {!result.ok ? (
        <ErrorBanner />
      ) : result.data.data.length === 0 ? (
        <EmptyState icon="🎫" text="Belum ada tiket." />
      ) : (
        <>
          <div className="space-y-3">
            {result.data.data.map((t) => (
              <Link
                key={t.ticket_number}
                href={`/tiket/${t.ticket_number}`}
                className="block rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{t.ticket_number}</span>
                  <StatusBadge value={t.status.value} label={t.status.label} />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                  <span>{t.issue_category}</span>
                  <DateDisplay value={t.created_at} format="short" />
                </div>
              </Link>
            ))}
          </div>

          <Pagination meta={result.data.meta} basePath="/tiket" searchParams={{}} />
        </>
      )}
    </div>
  );
}
